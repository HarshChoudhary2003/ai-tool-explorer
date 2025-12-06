import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  avatar_url: string | null;
  content: string;
  rating: number;
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_featured", true)
      .limit(6);

    if (data) setTestimonials(data);
  };

  if (testimonials.length === 0) {
    // Show placeholder testimonials if none in database
    const placeholders: Testimonial[] = [
      {
        id: "1",
        name: "Sarah Chen",
        role: "Product Manager",
        company: "TechStartup Inc",
        avatar_url: null,
        content: "AI Tools Explorer helped me find the perfect tool for our team. The comparison feature saved us hours of research!",
        rating: 5,
      },
      {
        id: "2",
        name: "Marcus Johnson",
        role: "Developer",
        company: "CodeCraft",
        avatar_url: null,
        content: "The AI recommendation feature is incredibly accurate. It understood our requirements and suggested tools we hadn't even considered.",
        rating: 5,
      },
      {
        id: "3",
        name: "Emily Rodriguez",
        role: "Marketing Director",
        company: "GrowthLabs",
        avatar_url: null,
        content: "Finally, a comprehensive directory that's actually useful. The filters make it easy to find exactly what I need.",
        rating: 5,
      },
    ];
    setTestimonials(placeholders);
  }

  return (
    <section className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
      <motion.div
        className="text-center mb-10 sm:mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
          What Our Users Say
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Join thousands of professionals who trust AI Tools Explorer
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="glass card-shadow h-full">
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {testimonial.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                      {testimonial.company && ` at ${testimonial.company}`}
                    </p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}