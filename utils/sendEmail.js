import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Plantilla HTML optimizada y elegante
        const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
            <div style="max-width: 500px; margin: auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <div style="background-color: #6d28d9; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; letter-spacing: 1px;">🐾 Petin</h1>
                </div>
                <div style="padding: 30px; text-align: center;">
                    <h2 style="color: #333;">¡Hola, ${options.name || 'Usuario'}!</h2>
                    <p style="color: #666; margin-bottom: 25px;">Aquí tienes tu código de seguridad para verificar tu cuenta:</p>
                    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 15px; margin: 20px auto; display: inline-block; border: 2px dashed #d1d5db;">
                        <h1 style="color: #6d28d9; font-size: 36px; margin: 0; letter-spacing: 5px; font-family: monospace;">${options.otpCode || options.message}</h1>
                    </div>
                    <p style="color: #9ca3af; font-size: 14px; margin-top: 25px;">Este código expirará en 10 minutos. No lo compartas con nadie.</p>
                </div>
            </div>
        </div>
        `;

        await transporter.sendMail({
            from: `"Seguridad Petin" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            html: htmlTemplate
        });

        console.log(`Correo seguro enviado a: ${options.email}`);
    } catch (error) {
        console.error('Error enviando correo:', error.message);
    }
};

export default sendEmail;
