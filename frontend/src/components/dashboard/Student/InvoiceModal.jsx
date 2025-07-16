"use client";
import { Icon } from "@iconify/react";

export default function InvoiceModal({ isOpen, onClose, data }) {
    if (!isOpen || !data) return null;

    const payload = data.payload || {};
    const customerData = payload.customer || {};
    const orderData = payload.order || {};
    const planData = data.subscription?.plan || {};

    const customer = {
        name: customerData.first_name ? `${customerData.first_name} ${customerData.last_name}` : "Dwyane Clark",
        address: customerData.billing_address ?
            `${customerData.billing_address}\n${customerData.billing_city}, ${customerData.billing_country}\n${customerData.billing_zip}` :
            "24 Dummy Street Area,\nLocation, Lorem Ipsum,\n570xx59x",
        phone: customerData.phone_number || "+1 (555) 123-4567"
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const invoiceNumber = orderData.id || "N/A";
    const invoiceDate = formatDate(data.purchaseDate);
    const totalAmount = parseFloat(orderData.total || 0);

    const items = [
        {
            sl: 1,
            description: planData.name ? `Subscription - ${planData.name.replace(/_/g, ' ')}` : "Scholarship Essay Subscription",
            price: totalAmount,
            qty: 1,
            total: totalAmount
        }
    ];

    // Dummy items only if no real data is available (for empty states)
    if (items.length === 1 && totalAmount === 0 && !planData.name) {
        items.push(
            { sl: 2, description: "Pellentesque id neque ligula", price: 20.00, qty: 3, total: 60.00 },
            { sl: 3, description: "Interdum et malesuada fames", price: 10.00, qty: 2, total: 20.00 }
        );
    }

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = 0.00;
    const grandTotal = subtotal + tax;

    const handleDownload = () => {
        if (data.invoiceUrl) {
            // If it's a relative URL, we might need to prefix the base URL
            let url = data.invoiceUrl;
            if (url.startsWith('/')) {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || '';
                url = `${baseUrl}${url}`;
            }
            window.open(url, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            {/* Modal Container */}
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[650px] relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-8">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <Icon icon="mdi:close" width={24} height={24} />
                </button>

                {/* Content Wrapper */}
                <div className="p-10 pb-6 flex-grow text-gray-800">

                    {/* Header: Logo and Title */}
                    <div className="flex justify-between items-start mb-4">
                        {/* Logo Section */}
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 flex items-center justify-center border-2 border-[#F6C844] transform rotate-45 rounded-sm">
                                <Icon icon="mdi:school" className="transform -rotate-45 text-[#F6C844]" width={24} height={24} />
                            </div>
                            <div className="ml-2">
                                <h1 className="text-xl font-bold text-black leading-none uppercase">MyScholarHack</h1>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Authentic Essays That Win</p>
                            </div>
                        </div>
                    </div>

                    {/* Yellow Bar & INV Title */}
                    <div className="flex items-center mb-8">
                        <div className="h-6 bg-[#F6C844] flex-grow mr-4"></div>
                        <h2 className="text-4xl font-normal text-[#333] tracking-wider uppercase">Invoice</h2>
                        <div className="h-6 bg-[#F6C844] w-12 ml-4"></div>
                    </div>

                    {/* Info Section */}
                    <div className="flex justify-between items-start mb-8">
                        {/* Invoice To */}
                        <div>
                            <h3 className="text-sm font-bold text-black mb-1">Invoice to:</h3>
                            <p className="text-sm font-bold text-gray-900 mb-1">{customer.name}</p>
                            <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">
                                {customer.address}
                            </p>
                        </div>

                        {/* Invoice Meta */}
                        <div className="text-right min-w-[200px]">
                            <div className="grid grid-cols-[1fr,auto] gap-x-8 gap-y-1 text-xs">
                                <span className="text-gray-900 font-bold text-left">Invoice#</span>
                                <span className="text-gray-500 font-medium">{invoiceNumber}</span>

                                <span className="text-gray-900 font-bold text-left">Date</span>
                                <span className="text-gray-500 font-medium">{invoiceDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="mb-0">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#333333] text-white">
                                    <th className="py-2.5 px-4 text-left text-[11px] font-bold uppercase tracking-wider w-10">Sl.</th>
                                    <th className="py-2.5 px-4 text-left text-[11px] font-bold uppercase tracking-wider">Item Description</th>
                                    <th className="py-2.5 px-4 text-center text-[11px] font-bold uppercase tracking-wider">Price</th>
                                    <th className="py-2.5 px-4 text-center text-[11px] font-bold uppercase tracking-wider">Qty.</th>
                                    <th className="py-2.5 px-4 text-right text-[11px] font-bold uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px]">
                                {items.map((item, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                        <td className="py-3 px-4 text-gray-700 font-medium border-b border-gray-100">{item.sl}</td>
                                        <td className="py-3 px-4 text-gray-700 font-bold border-b border-gray-100">{item.description}</td>
                                        <td className="py-3 px-4 text-center text-gray-700 font-bold border-b border-gray-100">${item.price.toFixed(2)}</td>
                                        <td className="py-3 px-4 text-center text-gray-700 font-bold border-b border-gray-100">{item.qty}</td>
                                        <td className="py-3 px-4 text-right text-gray-700 font-bold border-b border-gray-100">${item.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr className="h-12"><td colSpan="5"></td></tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Section */}
                    <div className="flex justify-between items-start mt-2">
                        {/* Left Column */}
                        <div className="flex-1 pr-8">
                            <h4 className="text-[11px] font-bold text-gray-900 mb-2">Thank you for your business</h4>

                            <div className="mb-3">
                                <h5 className="text-[11px] font-bold text-gray-900 mb-0.5">Note</h5>
                                <p className="text-[9px] text-gray-500 leading-tight">
                                    This invoice is automatically generated for your subscription to MyScholarHack premium services.
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Totals */}
                        <div className="w-48 pt-2">
                            <div className="flex justify-between items-center mb-1.5 px-1">
                                <span className="text-[11px] font-bold text-gray-800">Sub Total:</span>
                                <span className="text-[11px] font-bold text-gray-800">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-3 px-1">
                                <span className="text-[11px] font-bold text-gray-800">Tax:</span>
                                <span className="text-[11px] font-bold text-gray-800">{tax.toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#F6C844] px-2 py-1.5 ">
                                <span className="text-xs font-bold text-gray-900">Total:</span>
                                <span className="text-xs font-bold text-gray-900">${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Very Bottom Footer */}
                    <div className="mt-8 flex justify-between items-end border-t-2 border-[#F6C844] pt-3">
                        <div className="flex items-center gap-3 text-[10px] text-black font-bold">
                            <span>myscholarhack.com</span>
                        </div>
                        <div className="text-center relative top-2">
                            <div className="w-32 h-px bg-gray-400 mb-1"></div>
                            <p className="text-[10px] font-bold text-gray-800">Authorised Sign</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-8 pt-0 flex flex-col sm:flex-row gap-4 justify-center pb-8 px-10">
                    <button
                        onClick={handleDownload}
                        disabled={!data.invoiceUrl}
                        className={`flex-1 flex items-center justify-center gap-2 bg-[#F6C844] hover:bg-[#EDB91C] text-black font-bold py-3.5 rounded-full shadow-lg transition-all text-sm ${!data.invoiceUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Icon icon="mdi:download" width={20} height={20} />
                        Download Invoice PDF
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-full shadow-md transition-all text-sm"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}
