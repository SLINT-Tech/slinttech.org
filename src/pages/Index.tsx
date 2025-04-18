
import { Mail } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <ThemeToggle />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo Section */}
          <div className="w-full max-w-md">
            <img
              src="/images/c2f22049-1f3c-4154-b74d-9e2b35409333.png"
              alt="SLINT Tech Logo"
              className="w-full h-auto"
            />
          </div>

          {/* Main Content */}
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-slint">SLINT Tech</h1>
              <p className="text-xl text-foreground">
                This website is currently under development. We're working hard to bring something impactful soon!
              </p>
            </div>

            {/* Organization Info */}
            <div className="max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-sm border">
              <p className="text-card-foreground leading-relaxed">
                The domain <b>slinttech.org</b> is owned by our Nonprofits organization Selfless Leadership and Innovation for a New Tomorrow (SLINT Tech) and we use it for our Google Nonprofits Workspace.
              </p>
            </div>

            {/* Contact Section */}
            <div className="inline-flex items-center space-x-2 text-slint hover:text-slint-light transition-colors">
              <Mail size={20} />
              <a href="mailto:admin@slinttech.org" className="text-lg">
                admin@slinttech.org
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
