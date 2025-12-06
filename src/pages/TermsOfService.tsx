import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto prose prose-invert">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-8">
            Terms of Service
          </h1>

          <div className="glass p-6 sm:p-8 rounded-xl space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using AI Tools Explorer, you accept and agree to be bound by 
                these Terms of Service. If you do not agree to these terms, please do not use 
                our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
              <p>
                AI Tools Explorer provides a directory of AI tools, comparison features, and 
                AI-powered recommendations. We aggregate information about third-party AI tools 
                and services but do not create or maintain these tools.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. User Accounts</h2>
              <p>When you create an account, you agree to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Use the service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service</li>
                <li>Scrape or collect data without permission</li>
                <li>Upload malicious code or content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Intellectual Property</h2>
              <p>
                The content, features, and functionality of AI Tools Explorer are owned by us 
                and are protected by international copyright, trademark, and other intellectual 
                property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Third-Party Tools</h2>
              <p>
                We provide information about third-party AI tools for informational purposes only. 
                We do not endorse, guarantee, or assume responsibility for any third-party tools 
                listed on our platform. Users should review the terms and conditions of each tool 
                before use.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Disclaimer of Warranties</h2>
              <p>
                AI Tools Explorer is provided "as is" without warranties of any kind. We do not 
                guarantee that the service will be uninterrupted, secure, or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
              <p>
                In no event shall AI Tools Explorer be liable for any indirect, incidental, 
                special, consequential, or punitive damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users 
                of any material changes by posting the new terms on this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">10. Contact</h2>
              <p>
                For questions about these Terms of Service, please contact us at 
                legal@aitoolsexplorer.com
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