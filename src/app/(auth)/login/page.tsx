"use client";
import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Github,
  Chrome,
} from "lucide-react";

export default function SlidingAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: "", password: "", confirmPassword: "", fullName: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-2 sm:p-4 lg:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-20 left-20 sm:top-40 sm:left-40 w-30 h-30 sm:w-60 sm:h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main container */}
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl h-auto min-h-[500px] sm:min-h-[600px] lg:h-[600px] bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        {/* Mobile Layout (vertical stacking) */}
        <div className="block lg:hidden w-full h-full">
          {/* Info Section for Mobile */}
          <div
            className={`w-full bg-gradient-to-br from-purple-600/80 to-pink-600/80 backdrop-blur-lg transition-all duration-500 ease-in-out ${
              isLogin ? "h-32 sm:h-40" : "h-36 sm:h-44"
            }`}
          >
            <div className="flex flex-col justify-center items-center h-full px-4 sm:px-6 text-white text-center">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">
                {isLogin ? "Welcome Back!" : "Join Us Today!"}
              </h2>
              <p className="text-xs sm:text-sm opacity-90 mb-2 sm:mb-3 px-2">
                {isLogin
                  ? "Enter your credentials to access your account"
                  : "Create an account to join our community"}
              </p>
              <button
                onClick={toggleMode}
                className="px-4 py-2 sm:px-6 sm:py-2 border border-white/50 rounded-full hover:bg-white/20 transition-all duration-300 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 group"
              >
                {isLogin ? "Create Account" : "Sign In"}
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Form Section for Mobile */}
          <div className="flex-1 bg-white/95 backdrop-blur-lg p-4 sm:p-6">
            <div className="w-full max-w-xs sm:max-w-sm mx-auto">
              <div className="text-center mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                  {isLogin ? "Sign In" : "Sign Up"}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  {isLogin
                    ? "Welcome back to your account"
                    : "Create your new account"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {!isLogin && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full pl-8 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 text-sm sm:text-base"
                        placeholder="Enter your full name"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-8 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 text-sm sm:text-base"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 text-sm sm:text-base"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 text-sm sm:text-base"
                        placeholder="Confirm your password"
                        required={!isLogin}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-3 h-3 sm:w-4 sm:h-4"
                      />
                      <span className="ml-1.5 sm:ml-2 text-gray-600">
                        Remember me
                      </span>
                    </label>
                    <button
                      type="button"
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  {isLogin ? "Sign In" : "Create Account"}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                  >
                    <Chrome className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-gray-700">
                      Google
                    </span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                  >
                    <Github className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                    <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-gray-700">
                      GitHub
                    </span>
                  </button>
                </div>
              </form>

              <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  onClick={toggleMode}
                  className="font-medium text-purple-600 hover:text-purple-700 transition-colors"
                >
                  {isLogin ? "Sign up here" : "Sign in here"}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Layout (horizontal sliding) - Hidden on mobile */}
        <div className="hidden lg:flex relative w-full h-full">
          {/* Left panel - Info */}
          <div
            className={`absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-purple-600/80 to-pink-600/80 backdrop-blur-lg transition-transform duration-700 ease-in-out z-10 ${
              isLogin ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex flex-col justify-center items-center h-full p-6 xl:p-8 text-white">
              <div className="text-center space-y-4 xl:space-y-6">
                <h2 className="text-2xl xl:text-4xl font-bold mb-3 xl:mb-4">
                  {isLogin ? "Welcome Back!" : "Join Us Today!"}
                </h2>
                <p className="text-base xl:text-lg opacity-90 leading-relaxed max-w-md">
                  {isLogin
                    ? "Enter your credentials to access your account and continue your journey with us."
                    : "Create an account to unlock exclusive features and join our amazing community."}
                </p>
                <button
                  onClick={toggleMode}
                  className="mt-6 xl:mt-8 px-6 xl:px-8 py-2.5 xl:py-3 border-2 border-white/50 rounded-full hover:bg-white/20 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 group text-sm xl:text-base"
                >
                  {isLogin ? "Create Account" : "Sign In"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Right panel - Form */}
          <div
            className={`absolute top-0 right-0 w-1/2 h-full bg-white/95 backdrop-blur-lg transition-transform duration-700 ease-in-out ${
              isLogin ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex flex-col justify-center h-full p-6 xl:p-8">
              <div className="w-full max-w-sm mx-auto">
                <div className="text-center mb-6 xl:mb-8">
                  <h1 className="text-2xl xl:text-3xl font-bold text-gray-800 mb-2">
                    {isLogin ? "Sign In" : "Sign Up"}
                  </h1>
                  <p className="text-sm xl:text-base text-gray-600">
                    {isLogin
                      ? "Welcome back to your account"
                      : "Create your new account"}
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 xl:space-y-6"
                >
                  {!isLogin && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                          placeholder="Enter your full name"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                          placeholder="Confirm your password"
                          required={!isLogin}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {isLogin && (
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-gray-600">Remember me</span>
                      </label>
                      <button
                        type="button"
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  >
                    {isLogin ? "Sign In" : "Create Account"}
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                    >
                      <Chrome className="w-5 h-5 text-red-500" />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Google
                      </span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                    >
                      <Github className="w-5 h-5 text-gray-700" />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        GitHub
                      </span>
                    </button>
                  </div>
                </form>

                <p className="mt-4 xl:mt-6 text-center text-sm text-gray-600">
                  {isLogin
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <button
                    onClick={toggleMode}
                    className="font-medium text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    {isLogin ? "Sign up here" : "Sign in here"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
