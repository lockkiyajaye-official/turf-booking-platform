import { useState } from "react";
import { Mail, Phone, MapPin, Send, Clock, MessageSquare, CheckCircle2 } from "lucide-react";
import api from "../../services/api";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Call the backend API using axios
            const response = await api.post('/contact', formData);

            const result = response.data;
            console.log('Form submitted successfully:', result);

            // Show success message
            setSubmitStatus('success');
            setErrorMessage('');
            setFormData({ name: "", email: "", subject: "", message: "" });

            // Reset status after 5 seconds
            setTimeout(() => setSubmitStatus('idle'), 5000);
        } catch (error: any) {
            console.error('Form submission error:', error);

            // Handle validation errors from backend
            if (error.response?.status === 400) {
                const errorData = error.response.data;
                if (errorData.message && Array.isArray(errorData.message)) {
                    // Join multiple validation errors
                    setErrorMessage(errorData.message.join(', '));
                } else if (errorData.message) {
                    setErrorMessage(errorData.message);
                } else {
                    setErrorMessage('Please check your form data and try again.');
                }
            } else {
                setErrorMessage('Something went wrong. Please try again later.');
            }

            setSubmitStatus('error');

            // Reset error status after 5 seconds
            setTimeout(() => {
                setSubmitStatus('idle');
                setErrorMessage('');
            }, 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Reset status when user starts typing again
        if (submitStatus !== 'idle') {
            setSubmitStatus('idle');
            setErrorMessage('');
        }
    };

    const contactInfo = [
        {
            icon: <Mail className="w-6 h-6" />,
            title: "Email Us",
            info: "support@lockkiyajaye.com",
            desc: "We'll respond within 24 hours"
        },
        {
            icon: <Phone className="w-6 h-6" />,
            title: "Call Us",
            info: "+91 98765 43210",
            desc: "Mon-Sat: 9AM-6PM IST"
        },
        {
            icon: <MapPin className="w-6 h-6" />,
            title: "Visit Us",
            info: "123 Sports Street, Mumbai, India",
            desc: "Book a visit to our office"
        }
    ];

    const faqs = [
        {
            question: "How quickly will you respond to my inquiry?",
            answer: "We typically respond within 24 hours during business days."
        },
        {
            question: "Do you offer phone support?",
            answer: "Yes, we offer phone support Monday to Saturday, 9AM to 6PM IST."
        },
        {
            question: "Can I visit your office?",
            answer: "Absolutely! You can visit our office during business hours. Please schedule an appointment first."
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center pt-20">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/stadium.png"
                        alt="Contact Us"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center space-x-2 border border-white px-4 py-2 rounded-full mb-6">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-white text-sm font-bold tracking-wider">
                                Get In Touch
                            </span>
                        </div>
                        <h1 className="text-6xl md:text-6xl font-black text-white mb-6 leading-tight">
                            We're Here To{" "}
                            <span className="text-accent underline decoration-white/20 underline-offset-8">
                                Help You
                            </span>
                        </h1>
                        <p className="text-xl text-white/80 mb-10 max-w-xl leading-relaxed">
                            Have questions about booking turfs or need support? Our team is ready to assist you every step of the way.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-24 bg-light">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {contactInfo.map((contact, idx) => (
                            <div
                                key={idx}
                                className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 group"
                            >
                                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                                    {contact.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {contact.title}
                                </h3>
                                <p className="text-gray-900 font-semibold mb-2">
                                    {contact.info}
                                </p>
                                <p className="text-gray-500 text-sm">
                                    {contact.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form & Map */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Contact Form */}
                        <div>
                            <h2 className="text-4xl font-black text-gray-900 mb-6">
                                Send Us A Message
                            </h2>
                            <p className="text-gray-600 mb-8">
                                Fill out the form below and we'll get back to you as soon as possible.
                            </p>

                            {/* Status Messages */}
                            {submitStatus === 'success' && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-green-800 font-medium">Message sent successfully!</p>
                                        <p className="text-green-600 text-sm">We'll get back to you within 24 hours.</p>
                                    </div>
                                </div>
                            )}

                            {submitStatus === 'error' && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-red-800 font-medium mb-1">Validation Error</p>
                                    <p className="text-red-600 text-sm">
                                        {errorMessage || 'Please try again or contact us directly.'}
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                                        placeholder="How can we help you?"
                                        value={formData.subject}
                                        onChange={(e) => handleInputChange('subject', e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all resize-none"
                                        placeholder="Tell us more about your inquiry..."
                                        value={formData.message}
                                        onChange={(e) => handleInputChange('message', e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-accent/20 flex items-center space-x-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            <span>Send Message</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Map Placeholder & Office Info */}
                        <div className="space-y-8">
                            <div className="bg-gray-100 h-[400px] rounded-[2rem] overflow-hidden relative">
                                {/* Map Placeholder - Replace with actual map integration */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                    <div className="text-center">
                                        <MapPin className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                                        <p className="text-gray-600 font-medium mb-2">Map Integration</p>
                                        <p className="text-gray-500 text-sm">Add your map embed code here</p>
                                        <div className="mt-4 p-3 bg-white/80 backdrop-blur rounded-lg">
                                            <p className="text-xs text-gray-600">
                                                {/* Add your map iframe or API integration here */}
                                                {/* Example: <iframe src="YOUR_MAP_URL" ... /> */}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-light p-8 rounded-[2rem]">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                    Office Hours
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Clock className="w-5 h-5 text-accent" />
                                            <span className="font-medium">Monday - Friday</span>
                                        </div>
                                        <span className="font-bold text-gray-900">9:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Clock className="w-5 h-5 text-accent" />
                                            <span className="font-medium">Saturday</span>
                                        </div>
                                        <span className="font-bold text-gray-900">9:00 AM - 4:00 PM</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Clock className="w-5 h-5 text-gray-400" />
                                            <span className="font-medium text-gray-500">Sunday</span>
                                        </div>
                                        <span className="font-bold text-gray-400">Closed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-light">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">
                            Frequently Asked Questions
                        </h2>
                        <div className="w-24 h-1 bg-accent mx-auto"></div>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className="bg-white p-6 rounded-xl shadow-sm"
                            >
                                <div className="flex items-start space-x-4">
                                    <MessageSquare className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-2">
                                            {faq.question}
                                        </h4>
                                        <p className="text-gray-600">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="bg-accent rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-center">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                            Still Have Questions?
                        </h2>
                        <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                            Can't find the answer you're looking for? Our friendly team is always here to help.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button className="bg-white text-accent px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-xl">
                                <Mail className="w-5 h-5 inline mr-2" />
                                Email Us
                            </button>
                            <button className="bg-white/20 backdrop-blur text-white px-8 py-4 rounded-xl font-bold hover:bg-white/30 transition-all border border-white/30">
                                <Phone className="w-5 h-5 inline mr-2" />
                                Call Us
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
