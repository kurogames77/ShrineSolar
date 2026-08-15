import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { supabase } from '../supabaseClient';

export default function Maintenance() {
    const navigate = useNavigate();
    const [pageLoaded, setPageLoaded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        system_details: '',
        preferred_date: '',
        issue_description: ''
    });

    useEffect(() => {
        setPageLoaded(true);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.customer_name || !formData.customer_phone || !formData.issue_description) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'Please fill in all required fields.',
                confirmButtonColor: '#f59e0b',
            });
            return;
        }

        Swal.fire({
            title: 'Submitting Request...',
            text: 'Please wait.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('maintenance_requests')
                .insert({
                    id: crypto.randomUUID(),
                    customer_name: formData.customer_name.trim(),
                    customer_email: formData.customer_email.trim() || null,
                    customer_phone: formData.customer_phone.trim(),
                    system_details: formData.system_details.trim() || null,
                    issue_description: formData.issue_description.trim(),
                    preferred_date: formData.preferred_date || null,
                    status: 'pending'
                });

            if (error) throw error;

            Swal.fire({
                icon: 'success',
                title: 'Request Submitted!',
                text: 'Your maintenance request has been successfully submitted. We will contact you shortly.',
                confirmButtonColor: '#f59e0b',
                timer: 3000
            });

            // Clear form
            setFormData({
                customer_name: '',
                customer_phone: '',
                customer_email: '',
                system_details: '',
                preferred_date: '',
                issue_description: ''
            });

        } catch (error) {
            console.error('Supabase Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: 'There was an error submitting your request. Please try again later.',
                confirmButtonColor: '#ef4444',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#eef2f7] flex flex-col items-center pb-16">
            <style>{`
                @keyframes slideUpIn {
                    from { opacity: 0; transform: translateY(30px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .anim-slide-up {
                    opacity: 0;
                    transform: translateY(30px);
                }
                .anim-slide-up.loaded {
                    animation: slideUpIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
            `}</style>

            {/* Header Area */}
            <header 
                className={`anim-slide-up ${pageLoaded ? 'loaded' : ''} w-full max-w-4xl flex justify-center items-center pb-8 px-4 sm:px-8 relative`}
                style={{ paddingTop: '100px' }}
            >
                <button
                    onClick={() => navigate(-1)}
                    className="absolute left-4 sm:left-8 text-[#64748b] hover:text-[#1a2332] border-2 border-[#cbd5e1] hover:border-[#94a3b8] hover:bg-white/60 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors"
                    title="Go Back"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </button>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-wider text-[#1a2332]">Maintenance</h1>
            </header>

            {/* Main Form Container */}
            <main className="w-full max-w-2xl px-4 sm:px-8">
                <div 
                    className={`anim-slide-up ${pageLoaded ? 'loaded' : ''} w-full bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6 sm:p-10`}
                    style={{ animationDelay: '0.1s' }}
                >
                    <div className="text-center mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-[#1a2332] mb-3">Request Service</h2>
                        <p className="text-gray-500 text-sm sm:text-base">Fill out the form below and our team will get back to you to schedule an assessment or repair.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:gap-8">
                        
                        <div className="mycart-input-group">
                            <input 
                                type="text" 
                                name="customer_name"
                                value={formData.customer_name}
                                onChange={handleChange}
                                required
                                placeholder=" "
                                className="mycart-input bg-white" 
                            />
                            <label className="mycart-user-label">Full Name *</label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                            <div className="mycart-input-group">
                                <input 
                                    type="tel" 
                                    name="customer_phone"
                                    value={formData.customer_phone}
                                    onChange={handleChange}
                                    required
                                    placeholder=" "
                                    className="mycart-input bg-white" 
                                />
                                <label className="mycart-user-label">Contact Number *</label>
                            </div>
                            
                            <div className="mycart-input-group">
                                <input 
                                    type="email" 
                                    name="customer_email"
                                    value={formData.customer_email}
                                    onChange={handleChange}
                                    placeholder=" "
                                    className="mycart-input bg-white" 
                                />
                                <label className="mycart-user-label">Email Address (Optional)</label>
                            </div>
                        </div>

                        <div className="mycart-input-group">
                            <input 
                                type="text" 
                                name="system_details"
                                value={formData.system_details}
                                onChange={handleChange}
                                placeholder=" "
                                className="mycart-input bg-white" 
                            />
                            <label className="mycart-user-label">System Details / Model (Optional)</label>
                        </div>

                        <div className="mycart-input-group">
                            <input 
                                type="date" 
                                name="preferred_date"
                                value={formData.preferred_date}
                                onChange={handleChange}
                                placeholder=" "
                                className="mycart-input bg-white text-gray-700" 
                            />
                            <label className="mycart-user-label" style={formData.preferred_date ? {} : { transform: 'translateY(-50%) scale(0.8)', backgroundColor: '#ffffff', padding: '0 0.25em' }}>Preferred Date (Optional)</label>
                        </div>

                        <div className="mycart-input-group">
                            <textarea 
                                name="issue_description"
                                value={formData.issue_description}
                                onChange={handleChange}
                                required
                                placeholder=" "
                                rows={4}
                                className="mycart-input bg-white resize-none" 
                            ></textarea>
                            <label className="mycart-user-label">Describe the Issue *</label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <span>Submit Request</span>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
