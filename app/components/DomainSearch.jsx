"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import {
  FaWhatsapp,
  FaSearch,
  FaEnvelope,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaGlobeAmericas,
  FaRocket,
  FaLink,
  FaSpinner,
  FaInfoCircle,
} from "react-icons/fa";
import { HiMail, HiPhone, HiUser } from "react-icons/hi";

export default function DomainSearch() {
  const [domain, setDomain] = useState("");
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });
  const [alternativas, setAlternativas] = useState([]);
  const [checkingAlternativas, setCheckingAlternativas] = useState(false);

  const handleSearch = async (customDomain) => {
    const domainToSearch = (customDomain || domain).trim();
    setError("");
    setInfo(null);
    setAlternativas([]);

    if (!domainToSearch) {
      setError("Por favor ingresa un dominio válido (ej: ejemplo.com)");
      return;
    }

    setDomain(domainToSearch);
    setLoading(true);
    try {
      const res = await fetch(`/api/check-domain?domain=${encodeURIComponent(domainToSearch)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error en la consulta");

      setInfo(data);

      if (data.status !== "Disponible") {
        buscarAlternativas(domainToSearch);
      }
    } catch (err) {
      setError("No se pudo consultar el dominio");
    } finally {
      setLoading(false);
    }
  };

  const buscarAlternativas = async (dominioBase) => {
    setCheckingAlternativas(true);
    setAlternativas([]);

    const base = dominioBase.split(".")[0].toLowerCase();
    const extensionesBasicas = [".com", ".net", ".org", ".info", ".pe"];
    let disponibles = [];

    try {
      const resultadosBasicos = await Promise.all(
        extensionesBasicas.map(async (ext) => {
          const dom = `${base}${ext}`;
          try {
            const res = await fetch(`/api/check-domain?domain=${encodeURIComponent(dom)}`);
            const data = await res.json();
            return res.ok && data.status === "Disponible" ? dom : null;
          } catch {
            return null;
          }
        })
      );

      disponibles = resultadosBasicos.filter(Boolean);

      if (disponibles.length === 0) {
        const variaciones = [
          `${base}peru`,
          `${base}digital`,
          `${base}online`,
          `${base}group`,
          `${base}web`,
          `${base}store`,
          `get${base}`,
          `${base}360`,
          `${base}brand`,
          `${base}company`,
        ];

        const combinaciones = [];
        variaciones.forEach((nombre) => {
          extensionesBasicas.forEach((ext) => combinaciones.push(`${nombre}${ext}`));
        });

        const resultadosExtra = await Promise.all(
          combinaciones.map(async (dom) => {
            try {
              const res = await fetch(`/api/check-domain?domain=${encodeURIComponent(dom)}`);
              const data = await res.json();
              return res.ok && data.status === "Disponible" ? dom : null;
            } catch {
              return null;
            }
          })
        );

        disponibles = resultadosExtra.filter(Boolean);
      }

      setAlternativas(disponibles.slice(0, 10));
    } catch (error) {
      console.error("Error verificando alternativas:", error);
    } finally {
      setCheckingAlternativas(false);
    }
  };

  // === Manejo del formulario ===
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const res = await fetch("/api/send-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, dominio: info.domain }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar");

      await Swal.fire({
        icon: "success",
        title: "Solicitud enviada",
        text: `Gracias ${formData.nombre}, nos pondremos en contacto contigo pronto.`,
        confirmButtonColor: "#2563eb",
      });

      setShowForm(false);
      setFormData({ nombre: "", email: "", telefono: "" });
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Error al enviar",
        text: "Ocurrió un problema al enviar tu solicitud. Inténtalo más tarde.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <section className="w-full flex flex-col items-center justify-center min-h-[90vh] bg-gradient-to-b from-blue-50 via-white to-gray-100 px-4 md:px-6 py-12">
      <div className="max-w-2xl w-full bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl p-6 md:p-8 flex flex-col gap-6 border border-gray-100 relative overflow-hidden">
        <FaGlobeAmericas className="absolute top-6 right-6 text-blue-100 text-5xl md:text-6xl rotate-[15deg]" />

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3">
            <FaRocket className="text-blue-600 text-2xl md:text-3xl" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Buscador de Dominios
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            Encuentra el nombre perfecto para tu marca o empresa.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3.5 text-gray-400 text-lg" />
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value.trim())}
              placeholder="ej: brandingemocion.pe"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2 font-medium shadow-md hover:scale-[1.03]"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <FaSearch className="text-sm" />
                Buscar
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg mt-2">
            <FaTimesCircle />
            <span>{error}</span>
          </div>
        )}

        {info && (
          <div className="mt-3 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-inner">
            <div className="text-center">
              <div
                className={`flex flex-col items-center justify-center mb-3 ${
                  info.status === "Disponible" ? "text-green-600" : "text-red-600"
                }`}
              >
                {info.status === "Disponible" ? (
                  <>
                    <FaCheckCircle className="text-4xl mb-2 animate-bounce" />
                    <p className="text-xl font-bold text-green-700">
                      ¡Felicidades! Tu dominio está disponible.
                    </p>
                    <p className="text-gray-600 font-medium mt-1">
                      ¡Hazlo tuyo ahora!
                    </p>
                  </>
                ) : (
                  <>
                    <FaTimes className="text-3xl mb-1" />
                    <p className="text-lg md:text-xl font-semibold">
                      Dominio ocupado
                    </p>
                  </>
                )}
              </div>

              <p className="text-gray-600 font-medium text-sm md:text-base">
                {info.domain}
              </p>

              {info.status === "Disponible" && (
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 flex-wrap">
                  <a
                    href={`https://wa.me/51969956846?text=Hola,%20quiero%20solicitar%20el%20dominio%20${encodeURIComponent(
                      info.domain
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md hover:scale-[1.04]"
                  >
                    <FaWhatsapp size={20} />
                    Solicitar por WhatsApp
                  </a>

                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition shadow-md hover:scale-[1.04]"
                  >
                    <FaEnvelope size={18} />
                    Solicitar por formulario
                  </button>
                </div>
              )}

              {info.status !== "Disponible" && (
                <div className="mt-6">
                  <div className="flex items-center justify-center gap-2 mb-2 text-blue-700">
                    <FaInfoCircle className="text-blue-500" />
                    <h3 className="font-semibold text-gray-700">
                      Otras opciones disponibles:
                    </h3>
                  </div>

                  {checkingAlternativas ? (
                    <div className="flex justify-center items-center gap-2 text-gray-500 text-sm">
                      <FaSpinner className="animate-spin" />
                      <span>Buscando alternativas...</span>
                    </div>
                  ) : alternativas.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-2">
                      {alternativas.map((alt, i) => {
                        const colorClass = alt.endsWith(".pe")
                          ? "bg-green-50 text-green-700 border-green-100"
                          : alt.endsWith(".com")
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : alt.endsWith(".net")
                          ? "bg-gray-100 text-gray-700 border-gray-200"
                          : "bg-indigo-50 text-indigo-700 border-indigo-100";

                        return (
                          <span
                            key={i}
                            onClick={() => handleSearch(alt)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border hover:scale-[1.03] cursor-pointer flex items-center gap-2 transition ${colorClass}`}
                          >
                            <FaLink className="text-current" /> {alt}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No hay alternativas disponibles por ahora.
                    </p>
                  )}
                </div>
              )}

              {/* WHOIS */}
              {info.whois && (
                <details className="mt-6 bg-white rounded-lg p-4 text-left border">
                  <summary className="cursor-pointer font-semibold text-gray-700 flex items-center gap-2">
                    <FaGlobeAmericas className="text-blue-500" />
                    <span>Ver de quién es el dominio</span>
                  </summary>
                  <pre className="text-xs text-gray-700 mt-3 overflow-x-auto whitespace-pre-wrap bg-gray-50 p-3 rounded border">
                    {info.whois}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-fade-in border border-gray-200">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl transition"
            >
              <FaTimes />
            </button>

            <div className="mb-6 text-center">
              <FaEnvelope className="text-blue-600 text-3xl mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Solicitar dominio
              </h2>
              <p className="text-gray-600">
                Estás solicitando:{" "}
                <span className="font-semibold text-blue-600">{info?.domain}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                  required
                  disabled={formLoading}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-60"
                />
              </div>

              <div className="relative">
                <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Tu correo electrónico"
                  required
                  disabled={formLoading}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-60"
                />
              </div>

              <div className="relative">
                <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Tu teléfono o WhatsApp"
                  required
                  disabled={formLoading}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-60"
                />
              </div>

              <p className="text-xs text-gray-500 text-center">
                Te contactaremos en menos de 24 horas para ayudarte con tu registro.
              </p>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] disabled:opacity-60"
              >
                {formLoading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    <FaEnvelope /> Enviar solicitud
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
