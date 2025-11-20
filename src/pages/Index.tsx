import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Smartphone, Home, ShoppingCart, Shirt, Laptop, Book, Dumbbell, Brush, Gift } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const categories = [
    {
      id: 1,
      title: "Electronics",
      icon: <Laptop className="h-8 w-8 mb-2 text-[#3b82f6]" />,
      description: "Explore the latest gadgets and electronics",
    },
    {
      id: 2,
      title: "Fashion",
      icon: <Shirt className="h-8 w-8 mb-2 text-[#3b82f6]" />,
      description: "Discover trendy clothing and accessories",
    },
    {
      id: 3,
      title: "Home & Kitchen",
      icon: <Home className="h-8 w-8 mb-2 text-[#3b82f6]" />,
      description: "Find essential items for your home",
    },
    {
      id: 4,
      title: "Beauty & Personal Care",
      icon: <Brush className="h-8 w-8 mb-2 text-[#3b82f6]" />,
      description: "Premium beauty and personal care products",
    },
    {
      id: 5,
      title: "Sports & Outdoors",
      icon: <Dumbbell className="h-8 w-8 mb-2 text-[#3b82f6]" />,
      description: "Equipment for sports and outdoor activities",
    },
    {
      id: 6,
      title: "Books",
      icon: <Book className="h-8 w-8 mb-2 text-[#3b82f6]" />,
      description: "Bestsellers and new releases in all genres",
    },
  ];

  const handleCategoryClick = (category: string) => {
    navigate(`/shop?category=${category}`);
  };

  return (
    <div className="min-h-screen bg-[#F1F0FB]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#3b82f6]/10 to-[#60a5fa]/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Your One-Stop Shopping Destination
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Discover amazing products with fast shipping and great prices
            </p>
            <div className="mt-8">
              <Link to="/shop">
                <Button size="lg" className="mr-4 bg-[#3b82f6] hover:bg-[#2563eb]">
                  Shop Now
                </Button>
              </Link>
              <Link to="/shop">
                <Button variant="outline" size="lg" className="border-[#3b82f6] text-[#3b82f6]">
                  View Deals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-2xl font-semibold mb-8">Shop by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className="hover:shadow-lg transition-shadow border-[#3b82f6]/20 cursor-pointer"
              onClick={() => handleCategoryClick(category.title)}
            >
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center">
                  {category.icon}
                  <h4 className="text-xl font-semibold mb-2 text-[#2563eb]">{category.title}</h4>
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
