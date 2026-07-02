import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800 leading-relaxed">
      <div className="border-b pb-8 mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 italic">
          Last Updated: April 20, 2026
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <p className="mb-4">
            Welcome to <span className="font-semibold">Delight Crust</span>. We
            are committed to protecting your personal information and your right
            to privacy. This policy outlines how we handle your data when you
            use our food delivery platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 underline decoration-orange-500">
            1. Comprehensive Information Collection
          </h2>
          <p className="mb-3">
            We collect several types of information from and about users of our
            Website, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Personal Identifiable Information (PII):</strong> Full
              name, contact numbers, email addresses, and precise
              delivery/billing addresses.
            </li>
            <li>
              <strong>Account Credentials:</strong> Passwords, security hints,
              and authentication data for your secure login.
            </li>
            <li>
              <strong>Transaction Data:</strong> Payment details (processed via
              secure encryption) and order history.
            </li>
            <li>
              <strong>Technical Data:</strong> IP address, device type, browser
              identifiers, and location data collected automatically via
              cookies.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 underline decoration-orange-500">
            2. Detailed Use of Your Information
          </h2>
          <p className="mb-3">
            Your data allows us to provide a seamless food ordering experience.
            We use it to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Process, verify, and deliver your food orders accurately.</li>
            <li>Send real-time order tracking updates via SMS or Email.</li>
            <li>
              Improve our menu offerings based on your preferences and order
              frequency.
            </li>
            <li>
              Protect our platform from fraudulent transactions and unauthorized
              access.
            </li>
            <li>
              Send promotional offers (only if you opt-in) and administrative
              notices.
            </li>
          </ul>
        </section>

        <hr className="border-gray-200" />

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 underline decoration-orange-500">
            3. Information Sharing and Disclosure
          </h2>
          <p>
            We do not sell your data. We only share information with third-party
            delivery partners, payment gateways, and legal authorities if
            required by Pakistani law to ensure safety and service fulfillment.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 underline decoration-orange-500">
            4. Data Security and Retention
          </h2>
          <p>
            We implement industry-standard encryption and security protocols
            (SSL/TLS) to protect your data. We retain your information only as
            long as necessary for business or legal requirements. While we
            strive for 100% security, no method of transmission over the
            internet is completely foolproof.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 underline decoration-orange-500">
            5. Your Privacy Rights
          </h2>
          <p>
            You have the right to access, update, or delete your personal
            information at any time. If you wish to close your account or
            request a data export, please contact our support team.
          </p>
        </section>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-12">
          <h3 className="text-xl font-bold mb-2 text-gray-900">
            General Information
          </h3>
          <p className="text-gray-700 leading-relaxed">
            We are dedicated to using fresh, high-quality ingredients to ensure
            the best taste and overall experience. Our priority is to deliver
            your order hot, fresh, and on time.
          </p>
          <p className="text-gray-700 font-medium mt-4">
            For any questions or support, please reach out to us through our
            official support channels.
          </p>
        </div>
        <div className="flex justify-center pt-12 ">
          <button
            title="Go Home"
            onClick={() => navigate("/")}
            className="flex items-center cursor-pointer font-bold hover:underline transition-all py-3 px-8   rounded-full text-[#d44a1c] hover:text-[#d44a1c]"
          >
            ← Go Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
