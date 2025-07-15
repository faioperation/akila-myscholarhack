import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Generates an invoice PDF
 * @param {Object} data - Invoice data { orderId, customerName, customerEmail, productName, amount, date }
 * @param {string} outputPath - Path to save the PDF
 */
export const generateInvoicePDF = (data, outputPath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });

        // Output directory check
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Header
        doc
            .fontSize(20)
            .text('INVOICE', { align: 'center' })
            .moveDown();

        doc
            .fontSize(12)
            .text(`Invoice Number: ${data.orderId}`)
            .text(`Date: ${data.date}`)
            .moveDown();

        // Customer Info
        doc
            .fontSize(14)
            .text('Bill To:', { underline: true })
            .fontSize(12)
            .text(data.customerName)
            .text(data.customerEmail)
            .moveDown();

        // Order Table
        const tableTop = 250;
        doc.font('Helvetica-Bold');
        doc.text('Description', 50, tableTop);
        doc.text('Amount', 400, tableTop, { align: 'right' });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        doc.font('Helvetica');
        doc.text(data.productName, 50, tableTop + 30);
        doc.text(`$${data.amount}`, 400, tableTop + 30, { align: 'right' });

        doc.moveTo(50, tableTop + 50).lineTo(550, tableTop + 50).stroke();

        // Total
        doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .text(`Total: $${data.amount}`, 400, tableTop + 70, { align: 'right' });

        doc.end();

        stream.on('finish', () => resolve(outputPath));
        stream.on('error', (err) => reject(err));
    });
};
