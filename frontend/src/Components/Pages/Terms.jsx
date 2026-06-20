import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { contactConfig } from "../../Contants/Config"; // Path check kar lein ke sahi hai
const TermsAndConditions = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = "April 20, 2026";

  return (
    <div className="w-full bg-white text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto px-6 pt-8"></div>

      <div className=" py-16 px-6 border-b border-blue-100 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          Terms & Conditions
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Please read these terms carefully before using the Delight Crust
          platform. By using our service, you agree to these rules.
        </p>
        <p className="mt-2 text-sm font-semibold text-gray-500 uppercase tracking-widest">
          Last Updated: {lastUpdated}
        </p>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="hidden md:block">
            <div className="sticky top-24 space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Agreement Sections
              </h3>
              <nav className="flex flex-col space-y-2 font-medium">
                <a
                  href="#acceptance"
                  className="text-gray-600 hover:text-[#d44a1c] transition"
                >
                  Acceptance of Terms
                </a>
                <a
                  href="#orders"
                  className="text-gray-600 hover:text-[#d44a1c] transition"
                >
                  Ordering & Pricing
                </a>
                <a
                  href="#delivery"
                  className="text-gray-600 hover:text-[#d44a1c] transition"
                >
                  Delivery Policy
                </a>
                <a
                  href="#cancellation"
                  className="text-gray-600 hover:text-[#d44a1c] transition"
                >
                  Cancellation & Refunds
                </a>
                <a
                  href="#intellectual"
                  className="text-gray-600 hover:text-[#d44a1c] transition"
                >
                  Intellectual Property
                </a>
                <a
                  href="#liability"
                  className="text-gray-600 hover:text-[#d44a1c] transition"
                >
                  Limitation of Liability
                </a>
              </nav>
            </div>
          </div>

          <div className="md:col-span-2 space-y-12 leading-relaxed text-lg text-gray-700">
            <section id="acceptance">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-[#d44a1c] pl-4">
                1. Acceptance of Agreement
              </h2>
              <p>
                By accessing and using <strong>Delight Crust</strong>, you
                confirm that you are at least 18 years old or are accessing the
                site under the supervision of a parent or guardian. These terms
                constitute a legally binding agreement between you and Delight
                Crust.
              </p>
              <p className="mt-4">
                If you do not agree to all the terms and conditions of this
                agreement, then you may not access the website or use any
                services.
              </p>
            </section>

            <section id="orders" className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-[#d44a1c] pl-4">
                2. Ordering and Pricing
              </h2>
              <p>
                All orders placed through our website are subject to
                availability and acceptance. We reserve the right to refuse any
                order you place with us.
              </p>
              <p className="mt-4 font-semibold">Pricing Policy:</p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>
                  Prices for our food items are subject to change without
                  notice.
                </li>
                <li>
                  We make every effort to display the most accurate pricing, but
                  errors may occur. In case of a price error, we will notify you
                  before processing the order.
                </li>
                <li>
                  All prices listed are inclusive of applicable taxes unless
                  stated otherwise.
                </li>
              </ul>
            </section>

            <section id="delivery" className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-[#d44a1c] pl-4">
                3. Delivery Policy
              </h2>
              <p>
                We aim to deliver your food within the estimated time frame
                provided during checkout. However, delivery times are estimates
                and can be affected by traffic, weather conditions, or high
                demand.
              </p>
              <p className="mt-4 italic">
                Note: You are responsible for being available at the delivery
                address provided. If our rider is unable to contact you, the
                order may be cancelled without a refund.
              </p>
            </section>

            <section id="cancellation" className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-[#d44a1c] pl-4">
                4. Cancellation and Refunds
              </h2>
              <p>
                Orders can only be cancelled within 5 minutes of placement. Once
                the kitchen starts preparing your food, cancellations are no
                longer permitted.
              </p>
              <p className="mt-4">Refunds are only issued in cases of:</p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>Missing items in your order.</li>
                <li>Delivery of the wrong food items.</li>
                <li>Complete failure to deliver the order by our team.</li>
              </ul>
            </section>

            <section id="intellectual" className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-[#d44a1c] pl-4">
                5. Intellectual Property
              </h2>
              <p>
                The content on this website, including but not limited to the
                Delight Crust logo, graphics, images, and software code, is the
                property of Delight Crust and is protected by copyright and
                intellectual property laws. You may not use, reproduce, or
                distribute any content without our prior written consent.
              </p>
            </section>

            <section
              id="liability"
              className="border-t pt-8 bg-gray-50 p-8 rounded-2xl"
            >
              <h2 className="text-2xl font-bold  text-gray-900 mb-4">
                6. Limitation of Liability
              </h2>
              <p>
                Delight Crust shall not be liable for any indirect, incidental,
                or consequential damages resulting from the use or inability to
                use our services, including but not limited to food allergies if
                the user failed to check the ingredients or inform us
                beforehand.
              </p>
            </section>

            <section id="contact" className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-[#d44a1c] pl-4">
                7. Contact for Legal Inquiries
              </h2>
              <p>
                If you have any questions regarding these Terms and Conditions,
                please contact our legal team:
              </p>
              <div className="mt-6 p-8 bg-gray-800 text-white rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <p className="text-[#d44a1c] font-bold text-xl tracking-wide">
                    {contactConfig.legal.email}
                  </p>
                  <p className="text-gray-200 font-medium mt-1">
                    {contactConfig.legal.phone}
                  </p>
                </div>
                <div className="text-sm text-gray-400 max-w-xs text-center md:text-right">
                  Business hours: {contactConfig.legal.businessHours}
                </div>
              </div>
            </section>
          </div>
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

export default TermsAndConditions;
