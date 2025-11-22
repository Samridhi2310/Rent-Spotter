"use client";
import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

const PaymentButton = ({ bookingId, bookingStatus, onPaymentComplete }) => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  if (status !== "authenticated") {
    return <div>Please log in to proceed with the payment.</div>;
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async () => {
    if (!bookingId || !bookingStatus) {
      toast.error("Booking ID or status is missing.");
      return;
    }

    console.log("Initiating payment for:", { bookingId, bookingStatus });

    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        toast.error("Razorpay SDK failed to load.");
        return;
      }

      const response = await fetch(`/api/proxy/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, bookingStatus }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const { orderId, amount, key, paymentId } = await response.json();
      const amountInINR = amount / 100;

      console.log("Order created:", { orderId, amountInINR, paymentId });

      const options = {
        key,
        amount,
        currency: "INR",
        name: "PG Booking",
        description: `Payment for PG Booking ID: ${bookingId}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            console.log("Verifying payment:", response);
            const verifyResponse = await axios.post(`/api/proxy/api/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentId,
              },
              { withCredentials: true }
            );
            console.log("Payment verification response:", verifyResponse.data);
            toast.success("Payment successful!");
            onPaymentComplete(true);
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast.error("Payment verification failed. Please contact support.");
            onPaymentComplete(false);
          }
        },
        prefill: {
          name: session?.user?.name || "User Name",
          email: session?.user?.email || "user@example.com",
          contact: "1234567890",
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error(`Error initiating payment: ${error.message}`);
      onPaymentComplete(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: "#E6FFFA",
              color: "#2B6CB0",
              border: "1px solid #2B6CB0",
            },
          },
          error: {
            style: {
              background: "#FFF5F5",
              color: "#C53030",
              border: "1px solid #C53030",
            },
          },
        }}
      />
      <button
        onClick={initiatePayment}
        disabled={loading || !bookingId || !bookingStatus}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </>
  );
};

export default PaymentButton;