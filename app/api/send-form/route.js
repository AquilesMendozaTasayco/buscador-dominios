// ✅ app/api/send-form/route.js
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json();
    const { nombre, email, telefono, dominio } = body;

    if (!nombre || !email || !telefono || !dominio) {
      return Response.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: "mail.brandingemocion.net",
      port: 465,
      secure: true,
      auth: {
        user: "notificacion@brandingemocion.net",
        pass: "noti@2024",
      },
    });

    // ✉️ Contenido del correo
    const mailOptions = {
      from: `"Buscador de Dominios" <notificacion@brandingemocion.net>`,
      to: ["aquilesmt16@gmail.com", "psolar@emocion.pe"], // ✅ Enviar a ambos
      subject: `Solicitud de dominio: ${dominio}`,
      html: `
        <h2>Solicitud de dominio</h2>
        <p><b>Dominio:</b> ${dominio}</p>
        <p><b>Nombre:</b> ${nombre}</p>
        <p><b>Correo:</b> ${email}</p>
        <p><b>Teléfono:</b> ${telefono}</p>
        <hr>
        <p>Mensaje generado automáticamente desde el Buscador de Dominios de <b>Branding Emoción</b>.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error enviando correo:", error);
    return Response.json({ error: "Error al enviar el mensaje" }, { status: 500 });
  }
}
