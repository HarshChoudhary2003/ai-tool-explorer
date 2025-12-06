import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

export function FAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    const { data } = await supabase
      .from("faqs")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (data && data.length > 0) {
      setFaqs(data);
    } else {
      // Placeholder FAQs
      setFaqs([
        {
          id: "1",
          question: "What is AI Tools Explorer?",
          answer: "AI Tools Explorer is a comprehensive directory of 200+ AI tools across various categories. We help you discover, compare, and choose the right AI solutions for your needs.",
          category: "General",
        },
        {
          id: "2",
          question: "How does the AI recommendation feature work?",
          answer: "Our AI recommendation system analyzes your requirements, budget, and use case to suggest the most suitable AI tools. Simply describe what you need, and we'll provide personalized suggestions.",
          category: "Features",
        },
        {
          id: "3",
          question: "Is AI Tools Explorer free to use?",
          answer: "Yes! Browsing, comparing, and getting AI recommendations is completely free. We may offer premium features in the future, but core functionality will always remain free.",
          category: "Pricing",
        },
        {
          id: "4",
          question: "How often is the tool database updated?",
          answer: "We continuously update our database with new tools, pricing changes, and feature updates. Our team reviews and adds new AI tools weekly.",
          category: "General",
        },
        {
          id: "5",
          question: "Can I bookmark tools for later?",
          answer: "Yes! Create a free account to bookmark your favorite tools, save comparisons, and track recently viewed items. Your data syncs across all your devices.",
          category: "Features",
        },
        {
          id: "6",
          question: "How can I suggest a new AI tool?",
          answer: "We welcome suggestions! Use our contact form to submit new AI tools. Our team reviews each submission and adds verified tools to the directory.",
          category: "General",
        },
      ]);
    }
  };

  return (
    <section id="faq" className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
      <motion.div
        className="text-center mb-10 sm:mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
          <HelpCircle className="h-4 w-4" />
          <span className="text-sm font-medium">FAQ</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Everything you need to know about AI Tools Explorer
        </p>
      </motion.div>

      <motion.div
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="glass rounded-lg px-6 border-none"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-medium">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
}