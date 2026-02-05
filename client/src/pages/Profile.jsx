import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

import Loading from "@/components/Loading";

import { Fade } from "react-awesome-reveal";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  Package,
  Truck,
  Tag,
  CreditCard,
  ShoppingCart,
  Users,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";

function Profile() {
  // -------------------
  //      📦 State
  // -------------------
  const [formData, setFormData] = React.useState({});
  const [isEditing, setIsEditing] = React.useState(false);

  // -------------------
  //      🪝 Hooks
  // -------------------
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { profile, setProfile, loading, error, updateProfile } = useProfile();

  // -------------------
  //    🧭 Navigation
  // -------------------
  const navigate = useNavigate();

  // -------------------
  //  🔄 Early Returns
  // -------------------
  if (loading) return <Loading />;
  if (!profile) return <p>No profile data available</p>;

  // -------------------
  //     🖐️ Handlers
  // -------------------
  const handleEditProfile = () => {
    setIsEditing(true);
  };

  /*
   * Handle input change
   * @param {Event} e
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  /*
   * Handle submitting profile edits
   * @param {Event} e
   */
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsEditing(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    navigate("/login");
  }

  // Admin management links configuration
  const adminLinks = [
    {
      title: "Content Management",
      items: [
        {
          to: "/manageArticles",
          icon: FileText,
          label: "Manage Articles",
          description: "Create and edit products",
        },
        {
          to: "/adminUsers",
          icon: Users,
          label: "Manage Users",
          description: "User administration",
        },
      ],
    },
    {
      title: "E-commerce",
      items: [
        {
          to: "/orders",
          icon: ShoppingCart,
          label: "Orders",
          description: "View and manage all orders",
        },
        {
          to: "/shippingMethods",
          icon: Truck,
          label: "Shipping Methods",
          description: "Configure shipping options",
        },
        {
          to: "/coupons",
          icon: Tag,
          label: "Coupons",
          description: "Manage discount coupons",
        },
        {
          to: "/payments-methods",
          icon: CreditCard,
          label: "Payment Methods",
          description: "Configure payment options",
        },
      ],
    },
    {
      title: "Analytics",
      items: [
        {
          to: "/stats",
          icon: BarChart3,
          label: "Statistics",
          description: "Sales and order analytics",
        },
      ],
    },
  ];

  return (
    <section className="block mx-auto justify-center min-h-screen px-4 py-12">
      <Fade cascade triggerOnce duration={500}>
        <div className="w-full max-w-4xl mx-auto space-y-6">
          {/* Profile Card */}
          <Card className="shadow-lg">
            <CardHeader className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24 outline">
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${profile?.username}`}
                  alt={profile.username}
                />
                <AvatarFallback>
                  {profile.username
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="w-full">
                {isEditing ? (
                  <h2 className="text-2xl font-bold text-center">
                    <input
                      type="text"
                      value={formData.username || profile.username}
                      onChange={handleChange}
                      name="username"
                      className="mt-1 block w-full rounded-md border-border bg-input px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </h2>
                ) : (
                  <h2 className="text-2xl font-bold text-center">
                    {profile.username}
                  </h2>
                )}
                <p className="text-sm text-muted-foreground text-center">
                  {profile.email}
                </p>
                {profile.admin && (
                  <div className="mt-2 flex justify-center">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      Administrator
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardFooter className="flex flex-col md:flex-row justify-center gap-4">
              {isEditing ? (
                <>
                  <Button className="cursor-pointer" onClick={handleSubmitEdit}>
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Admin Management Panel */}
          {isAdmin && !isEditing && (
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">Admin Panel</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Manage your store and content
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {adminLinks.map((section, sectionIdx) => (
                  <div key={sectionIdx}>
                    {sectionIdx > 0 && <Separator className="my-6" />}
                    
                    <h4 className="text-sm font-medium text-muted-foreground mb-4">
                      {section.title}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.items.map((item, itemIdx) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={itemIdx}
                            to={item.to}
                            className="group"
                          >
                            <div className="flex items-start gap-4 rounded-lg border border-border p-4 transition-all hover:border-primary hover:bg-accent/50 cursor-pointer">
                              <div className="rounded-md bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm group-hover:text-primary transition-colors">
                                  {item.label}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* User Orders Section (for non-admin users) */}
          {!isAdmin && !isEditing && (
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">My Orders</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Track your purchases
                </p>
              </CardHeader>

              <CardContent>
                <Link to="/my-orders">
                  <div className="flex items-start gap-4 rounded-lg border border-border p-4 transition-all hover:border-primary hover:bg-accent/50 cursor-pointer">
                    <div className="rounded-md bg-primary/10 p-2">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">View Order History</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        See all your past and current orders
                      </p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </Fade>
    </section>
  );
}

export default Profile;