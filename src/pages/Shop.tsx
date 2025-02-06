
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Shop = () => {
  const products = [
    {
      id: 1,
      name: "Paracetamol 500mg",
      price: 149,
      rating: 4.5,
      image: "https://via.placeholder.com/200",
      description: "Effective pain relief and fever reducer",
      category: "Pain Relief",
    },
    {
      id: 2,
      name: "Vitamin C 1000mg",
      price: 399,
      rating: 4.8,
      image: "https://via.placeholder.com/200",
      description: "Immune system support supplement",
      category: "Vitamins",
    },
    {
      id: 3,
      name: "Digital BP Monitor",
      price: 1499,
      rating: 4.7,
      image: "https://via.placeholder.com/200",
      description: "Accurate blood pressure monitoring",
      category: "Medical Devices",
    },
    {
      id: 4,
      name: "First Aid Kit",
      price: 899,
      rating: 4.6,
      image: "https://via.placeholder.com/200",
      description: "Complete emergency medical kit",
      category: "Medical Supplies",
    },
    {
      id: 5,
      name: "Omega-3 Fish Oil",
      price: 599,
      rating: 4.4,
      image: "https://via.placeholder.com/200",
      description: "Heart and brain health supplement",
      category: "Supplements",
    },
    {
      id: 6,
      name: "Hand Sanitizer",
      price: 99,
      rating: 4.3,
      image: "https://via.placeholder.com/200",
      description: "Kills 99.9% of germs",
      category: "Personal Care",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F1F0FB]">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-[#9b87f5]">E-Pharma</h1>
            </Link>
            <div className="flex-1 max-w-lg mx-auto px-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/cart">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5 text-[#9b87f5]" />
                </Button>
              </Link>
              <Link to="/login">
                <Button className="bg-[#9b87f5] hover:bg-[#7E69AB]">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Filter and Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="md:col-span-1">
            <Card className="p-4 border-[#9b87f5]/20">
              <h3 className="font-semibold mb-4">Filters</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Categories</h4>
                  <div className="space-y-2">
                    {["Pain Relief", "Vitamins", "Medical Devices", "Medical Supplies", "Supplements", "Personal Care"].map(
                      (category) => (
                        <label key={category} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded border-gray-300 text-[#9b87f5]" />
                          <span className="text-sm">{category}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Price Range</h4>
                  <div className="space-y-2">
                    <Input type="number" placeholder="Min" className="w-full" />
                    <Input type="number" placeholder="Max" className="w-full" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-2 lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="border-[#9b87f5]/20">
                  <CardContent className="p-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {product.description}
                    </p>
                    <div className="flex items-center space-x-1 mb-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">
                        {product.rating}
                      </span>
                    </div>
                    <p className="text-[#9b87f5] font-semibold">
                      ₹{product.price.toFixed(2)}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full bg-[#9b87f5] hover:bg-[#7E69AB]">
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
