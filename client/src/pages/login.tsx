import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { loginUserSchema, type LoginUser } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(key, language);

  const form = useForm<LoginUser>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginUser) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t("auth.login.success"),
        description: t("auth.login.welcomeBack"),
      });
      // Redirect to home page
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: t("auth.login.error"),
        description: error.message || t("auth.login.invalidCredentials"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginUser) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full mix-blend-multiply dark:mix-blend-color-dodge filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-purple-200 dark:bg-purple-800 rounded-full mix-blend-multiply dark:mix-blend-color-dodge filter blur-xl opacity-70 animate-float-delayed"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-pink-200 dark:bg-pink-800 rounded-full mix-blend-multiply dark:mix-blend-color-dodge filter blur-xl opacity-70 animate-float"></div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Back to Home")}
            </Button>
          </Link>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("Welcome Back")}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                {t("Enter your credentials to access your account")}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        {t("Username or Email")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            {...field}
                            type="text"
                            placeholder={t("Enter your username or email")}
                            className="pl-10 bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                            autoComplete="username"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        {t("Password")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder={t("Enter your password")}
                            className="pl-10 pr-10 bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <Link href="/forgot-password">
                    <Button variant="link" size="sm" className="text-blue-600 dark:text-blue-400 p-0 h-auto">
                      {t("Forgot your password?")}
                    </Button>
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2.5"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? t("Signing in...") : t("Sign In")}
                </Button>
              </form>
            </Form>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("Don't have an account?")}{" "}
                <Link href="/register">
                  <Button variant="link" size="sm" className="text-blue-600 dark:text-blue-400 p-0 h-auto font-medium">
                    {t("Sign up")}
                  </Button>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {t("Your data is protected with end-to-end encryption")}
          </p>
        </div>
      </div>
    </div>
  );
}