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

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Error from "@/components/Error";

import { toast } from "sonner";

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
  //if (error) return <Error message={error.message} />;
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

  return (
    <section className="block mx-auto justify-center min-h-screen px-4 py-12">
      <Fade cascade triggerOnce duration={500}>
        <Card className="w-full max-w-md mx-auto shadow-lg">
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

            <div>
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
              <p className="mt-1 text-xs text-muted-foreground text-center">
                {profile.admin ? "Admin" : "User"}
              </p>
            </div>
          </CardHeader>
          <CardFooter className="flex flex-col md:flex-row justify-center gap-4">
            {isAdmin && !isEditing && (
              <Link to="/manageArticles">
                <Button variant="outline" className="cursor-pointer">
                  Manage Articles
                </Button>
              </Link>
            )}
            {isAdmin && !isEditing && (
              <Link to="/adminUsers">
                <Button variant="outline" className="cursor-pointer">
                  Manage Users
                </Button>
              </Link>
            )}
            {/*
            <Button
              variant="outline"
              onClick={handleLogout}
              className="cursor-pointer"
            >
              Logout
            </Button>
            */}
            {isEditing ? (
              <Button className="cursor-pointer" onClick={handleSubmitEdit}>
                Save
              </Button>
            ) : (
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={handleEditProfile}
              >
                Edit Profile
              </Button>
            )}
            {isEditing && (
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            )}
          </CardFooter>
        </Card>
      </Fade>
    </section>
  );
}

export default Profile;
