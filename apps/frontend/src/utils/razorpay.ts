declare global {
    interface Window {
        Razorpay: any;
    }
}

export async function loadRazorpayScript(): Promise<boolean> {
    if (window.Razorpay) {
        return true;
    }

    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

