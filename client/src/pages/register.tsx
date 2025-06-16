import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Shield, UserPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { registerUserSchema, type RegisterUser } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(key, language);

  const form = useForm<RegisterUser>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterUser) => {
      return await apiRequest("/api/auth/register", { method: "POST", body: data });
    },
    onSuccess: (data) => {
      toast({
        title: t("auth.register.success"),
        description: t("auth.register.verificationSent"),
      });
      // Redirect to home page
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: t("auth.register.error"),
        description: error.message || t("auth.register.failed"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterUser) => {
    registerMutation.mutate(data);
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

  const password = form.watch("password");
  const passwordStrength = getPasswordStrength(password || "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200 dark:bg-green-800 rounded-full mix-blend-multiply dark:mix-blend-color-dodge filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-blue-200 dark:bg-blue-800 rounded-full mix-blend-multiply dark:mix-blend-color-dodge filter blur-xl opacity-70 animate-float-delayed"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-purple-200 dark:bg-purple-800 rounded-full mix-blend-multiply dark:mix-blend-color-dodge filter blur-xl opacity-70 animate-float"></div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("auth.backToHome")}
            </Button>
          </Link>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("auth.register.title")}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                {t("auth.register.subtitle")}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* First Name and Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">
                          {t("auth.register.firstName")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder={t("auth.register.firstNamePlaceholder")}
                            className="bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                            autoComplete="given-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">
                          {t("auth.register.lastName")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder={t("auth.register.lastNamePlaceholder")}
                            className="bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                            autoComplete="family-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Username */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        {t("auth.register.username")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            {...field}
                            type="text"
                            placeholder={t("auth.register.usernamePlaceholder")}
                            className="pl-10 bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                            autoComplete="username"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        {t("auth.register.email")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            {...field}
                            type="email"
                            placeholder={t("auth.register.emailPlaceholder")}
                            className="pl-10 bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                            autoComplete="email"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        {t("auth.register.password")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder={t("auth.register.passwordPlaceholder")}
                            className="pl-10 pr-10 bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                            autoComplete="new-password"
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
                      {password && (
                        <div className="mt-2">
                          <div className="flex space-x-1 mb-2">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`h-1 flex-1 rounded ${
                                  level <= passwordStrength
                                    ? passwordStrength <= 2
                                      ? "bg-red-500"
                                      : passwordStrength <= 3
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                    : "bg-gray-200 dark:bg-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {passwordStrength <= 2
                              ? t("auth.register.passwordWeak")
                              : passwordStrength <= 3
                              ? t("auth.register.passwordMedium")
                              : t("auth.register.passwordStrong")}
                          </p>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        {t("auth.register.confirmPassword")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t("auth.register.confirmPasswordPlaceholder")}
                            className="pl-10 pr-10 bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium py-2.5"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? t("auth.register.creating") : t("auth.register.createAccount")}
                </Button>
              </form>
            </Form>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("auth.register.hasAccount")}{" "}
                <Link href="/login">
                  <Button variant="link" size="sm" className="text-blue-600 dark:text-blue-400 p-0 h-auto font-medium">
                    {t("auth.register.signIn")}
                  </Button>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Check className="w-3 h-3 text-green-500" />
              <span>{t("auth.register.secureEncryption")}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Check className="w-3 h-3 text-green-500" />
              <span>{t("auth.register.emailVerification")}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-md mx-auto">
            {t("auth.register.termsNotice")}
          </p>
        </div>
      </div>
    </div>
  );
}