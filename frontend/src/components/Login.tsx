import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Glasses, Sparkles, Zap, Shield } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

type LoginProps = {
  onLogin: () => void;
};

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in production, this would validate against your PostgreSQL backend
    onLogin();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-blue-900/5 via-slate-100 to-blue-100/60 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-900/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-blue-200/20 to-slate-200/20 rounded-full blur-3xl"></div>
        
        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="text-3xl">🏠</div>
              <h1 className="text-slate-900" style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Real(i)ty.AI
              </h1>
            </div>
            
            {/* Meta Glasses Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-3.5 py-2 shadow-sm">
              <Glasses className="w-4 h-4 text-blue-900" />
              <span className="text-blue-900" style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '-0.01em' }}>
                Powered by Meta Glasses
              </span>
            </div>
          </div>

          {/* Hero Message */}
          <div className="mb-8">
            <h2 className="text-slate-900 mb-4" style={{ fontSize: '36px', fontWeight: 700, lineHeight: '1.15', letterSpacing: '-0.03em' }}>
              Welcome Back
            </h2>
            <p className="text-slate-600 max-w-md" style={{ fontSize: '16px', lineHeight: '1.6', letterSpacing: '-0.01em' }}>
              Sign in to analyze properties with AI-powered inspections
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5 mb-8">
            <div>
              <Label htmlFor="email" className="text-slate-700 mb-2 block" style={{ fontSize: '14px', fontWeight: 600 }}>
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-12 border-slate-200 bg-white/80 backdrop-blur-sm focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 transition-all shadow-sm"
                style={{ fontSize: '15px' }}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="password" className="text-slate-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Password
                </Label>
                <a 
                  href="#" 
                  className="text-blue-900 hover:text-blue-800 transition-colors"
                  style={{ fontSize: '13px', fontWeight: 600 }}
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 border-slate-200 bg-white/80 backdrop-blur-sm focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 transition-all shadow-sm"
                style={{ fontSize: '15px' }}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-900 hover:bg-blue-800 text-white transition-all shadow-lg hover:shadow-xl mt-6"
              style={{ fontSize: '16px', fontWeight: 600 }}
            >
              Sign In
            </Button>
          </form>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center mb-2">
                <Zap className="w-4 h-4 text-blue-900" />
              </div>
              <h4 className="text-slate-900 mb-1" style={{ fontSize: '13px', fontWeight: 600 }}>
                Instant
              </h4>
              <p className="text-slate-600" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                Real-time AI analysis
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center mb-2">
                <Shield className="w-4 h-4 text-blue-900" />
              </div>
              <h4 className="text-slate-900 mb-1" style={{ fontSize: '13px', fontWeight: 600 }}>
                Accurate
              </h4>
              <p className="text-slate-600" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                Detailed reports
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center mb-2">
                <Sparkles className="w-4 h-4 text-blue-900" />
              </div>
              <h4 className="text-slate-900 mb-1" style={{ fontSize: '13px', fontWeight: 600 }}>
                Simple
              </h4>
              <p className="text-slate-600" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                Easy to use
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-slate-500" style={{ fontSize: '14px' }}>
              Don't have an account?{' '}
              <a href="#" className="text-blue-900 hover:text-blue-800 transition-colors" style={{ fontWeight: 600 }}>
                Contact Sales
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-900">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob21lJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYxMzU2MjI2fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Luxury property interior"
            className="w-full h-full object-cover"
          />
          {/* Stronger Overlay for Better Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 via-slate-900/65 to-slate-900/80"></div>
        </div>

        {/* Content Overlay - Centered */}
        <div className="relative h-full flex flex-col justify-center items-center text-center p-12">
          <div className="max-w-lg">
            {/* Meta Glasses Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 mb-6 shadow-lg">
              <Glasses className="w-4 h-4 text-white" />
              <span className="text-white" style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                Powered by Meta Glasses
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="text-white mb-6" style={{ fontSize: '42px', fontWeight: 900, lineHeight: '1.15', letterSpacing: '-0.03em', textShadow: '0 6px 16px rgba(0, 0, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.4)' }}>
              Analyze any home with Meta glasses
            </h2>
            
            {/* Subheadline with Background */}
            <div className="inline-block bg-slate-900/40 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10">
              <p className="text-white" style={{ fontSize: '19px', lineHeight: '1.6', letterSpacing: '-0.01em', fontWeight: 700, textShadow: '0 3px 10px rgba(0, 0, 0, 0.7), 0 1px 3px rgba(0, 0, 0, 0.5)' }}>
                AI-powered inspections with instant issue detection and cost analysis
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}