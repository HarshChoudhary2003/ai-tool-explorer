import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto prose prose-invert">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-8">
            Privacy Policy
          </h1>

          <div className="glass p-6 sm:p-8 rounded-xl space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
              <p>
                AI Tools Explorer ("we", "our", or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                information when you visit our website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Information We Collect</h2>
              <p>We may collect information about you in various ways:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Personal Data:</strong> Email address, name, and profile information when you create an account</li>
                <li><strong>Usage Data:</strong> Information about how you use our website, including pages visited and tools viewed</li>
                <li><strong>Contact Data:</strong> Information you provide when contacting us or submitting forms</li>
                <li><strong>Cookies:</strong> We use cookies to enhance your browsing experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide, operate, and maintain our website</li>
                <li>Improve, personalize, and expand our services</li>
                <li>Understand and analyze how you use our website</li>
                <li>Send you newsletters and updates (with your consent)</li>
                <li>Respond to your comments, questions, and requests</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect 
                your personal information. However, no method of transmission over the Internet 
                is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Third-Party Services</h2>
              <p>
                We may use third-party services that collect, monitor, and analyze data to improve 
                our service. These third parties have their own privacy policies addressing how 
                they use such information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Access, update, or delete your personal information</li>
                <li>Opt-out of receiving marketing communications</li>
                <li>Request a copy of your data</li>
                <li>Object to processing of your personal information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at 
                privacy@aitoolsexplorer.com
              </p>
            </section>

            <p className="text-sm text-muted-foreground pt-4 border-t border-border">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}