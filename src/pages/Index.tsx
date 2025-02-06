
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pill, Search, ShoppingCart, Heart, Bell } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      id: 1,
      title: "Prescription Medicines",
      icon: <Pill className="h-8 w-8 mb-2" />,
      description: "Browse through our prescription medications",
    },
    {
      id: 2,
      title: "Healthcare Products",
      icon: <Heart className="h-8 w-8 mb-2" />,
      description: "Explore healthcare and wellness items",
    },
    {
      id: 3,
      title: "Medical Equipment",
      icon: <Pill className="h-8 w-8 mb-2" />,
      description: "Find essential medical equipment",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-primary">E-Pharma</h1>
            </div>
            <div className="hidden md:flex flex-1 justify-center px-4">
              <div className="max-w-lg w-full">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search medicines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              <Button>Login</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-primary/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Your Health, Our Priority
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Get your medicines delivered at your doorstep
            </p>
            <div className="mt-8">
              <Button size="lg" className="mr-4">
                Shop Now
              </Button>
              <Button variant="outline" size="lg">
                Upload Prescription
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-2xl font-semibold mb-8">Shop by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center">
                  {category.icon}
                  <h4 className="text-xl font-semibold mb-2">{category.title}</h4>
                  <p className="text-gray-600">{category.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
