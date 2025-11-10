export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");

  if (!domain) {
    return Response.json({ error: "Dominio no especificado" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.whois.vu/?q=${encodeURIComponent(domain)}`);
    const data = await res.json();

    if (!data || !data.domain) {
      return Response.json({ domain, status: "Desconocido" }, { status: 200 });
    }

    const disponible =
      data.available === true ||
      data.available === "yes" ||
      data.available === "true" ||
      data.available === "1";

    const status = disponible ? "Disponible" : "Tomado";

    return Response.json(
      {
        domain: data.domain,
        status,
        whois: data.whois || "Sin datos WHOIS",
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { error: "Error consultando WHOIS.VU" },
      { status: 500 }
    );
  }
}
