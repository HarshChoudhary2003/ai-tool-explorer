import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Sparkles, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const submitToolSchema = z.object({
  name: z.string().min(2, "Tool name must be at least 2 characters").max(100, "Tool name must be less than 100 characters"),
  website_url: z.string().url("Please enter a valid URL"),
  description: z.string().min(20, "Description must be at least 20 characters").max(500, "Description must be less than 500 characters"),
  category: z.string().min(1, "Please select a category"),
  pricing: z.string().min(1, "Please select a pricing model"),
  submitter_name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  submitter_email: z.string().email("Please enter a valid email"),
  additional_info: z.string().max(1000, "Additional info must be less than 1000 characters").optional(),
});

type SubmitToolForm = z.infer<typeof submitToolSchema>;

const categories = [
  { value: "llm", label: "LLMs & Language Models" },
  { value: "image_generation", label: "Image Generation" },
  { value: "voice", label: "Voice & Audio" },
  { value: "video", label: "Video Generation" },
  { value: "code_assistant", label: "Code Assistants" },
  { value: "automation", label: "Automation" },
  { value: "productivity", label: "Productivity" },
  { value: "data_analysis", label: "Data Analysis" },
  { value: "no_code", label: "No-Code Tools" },
  { value: "other", label: "Other" },
];

const pricingOptions = [
  { value: "free", label: "Free" },
  { value: "freemium", label: "Freemium" },
  { value: "paid", label: "Paid" },
  { value: "enterprise", label: "Enterprise" },
];

export default function SubmitTool() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<SubmitToolForm>({
    resolver: zodResolver(submitToolSchema),
    defaultValues: {
      name: "",
      website_url: "",
      description: "",
      category: "",
      pricing: "",
      submitter_name: "",
      submitter_email: "",
      additional_info: "",
    },
  });

  const onSubmit = async (data: SubmitToolForm) => {
    setLoading(true);
    try {
      const insertData = {
        name: data.name,
        website_url: data.website_url,
        description: data.description,
        category: data.category,
        pricing: data.pricing,
        submitter_name: data.submitter_name,
        submitter_email: data.submitter_email,
        additional_info: data.additional_info || null,
      };
      
      const { error } = await supabase.from("tool_submissions").insert([insertData]);

      if (error) throw error;

      // Send confirmation email
      try {
        await supabase.functions.invoke("send-notification-email", {
          body: {
            type: "tool_submission",
            data: {
              email: data.submitter_email,
              name: data.submitter_name,
              toolName: data.name,
              website: data.website_url,
              category: categories.find(c => c.value === data.category)?.label || data.category,
            },
          },
        });
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
        // Don't fail the submission if email fails
      }

      setSubmitted(true);
      toast({
        title: "Tool Submitted!",
        description: "Thank you for your submission. We'll review it soon!",
      });
    } catch (error: any) {
      console.error("Error submitting tool:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
            <p className="text-muted-foreground mb-6">
              Your tool submission has been received. Our team will review it and add it to the directory if it meets our criteria.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Check your email for a confirmation message.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate("/tools")}>
                Browse Tools
              </Button>
              <Button variant="outline" onClick={() => { setSubmitted(false); form.reset(); }}>
                Submit Another
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-10">
          <Badge className="mb-4 glass border-primary/30 text-primary">
            <Sparkles className="h-3 w-3 mr-1" />
            Contribute
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-4">
            Submit an AI Tool
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Know an amazing AI tool that should be in our directory? Submit it for review and help others discover it.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto glass card-shadow">
          <CardHeader>
            <CardTitle>Tool Information</CardTitle>
            <CardDescription>
              Please provide accurate information about the AI tool you're submitting.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tool Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., ChatGPT" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL *</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what this tool does and its key features..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>20-500 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pricing"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pricing Model *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select pricing" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pricingOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Your Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="submitter_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="submitter_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="additional_info"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Information</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional details, features, or notes about the tool..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Tool for Review
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}