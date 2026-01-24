import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Edit2, Plus } from "lucide-react";

function CategoryManager({
  categoryForm,
  onCategoryFormChange,
  onCategorySubmit,
  onEditCategory,
  categories,
  categoryAmount,
  categoriesLoading,
  onDeleteCategory,
  isEditingCategory,
  onEditCategorySubmit,
}) {
  return (
    <div className="w-full mx-auto space-y-6">
      {/* Form Card */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {isEditingCategory ? "Edit Category" : "New Category"}
          </CardTitle>
          <CardDescription>
            {isEditingCategory
              ? "Update the details of your category"
              : "Create a new category to organize your articles"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={
              isEditingCategory ? onEditCategorySubmit : onCategorySubmit
            }
            className="space-y-4"
          >
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="cat-name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="cat-name"
                name="name"
                placeholder="E.g., Technology, Health, Lifestyle"
                value={categoryForm.name}
                onChange={onCategoryFormChange}
                required
                className="transition-colors focus:ring-2"
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="cat-desc" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="cat-desc"
                name="description"
                placeholder="A brief description of the category"
                value={categoryForm.description}
                onChange={onCategoryFormChange}
                rows={3}
                className="resize-none transition-colors focus:ring-2"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={categoriesLoading}
                className="flex-1"
              >
                {categoriesLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    {isEditingCategory ? "Updating..." : "Creating..."}
                  </>
                ) : isEditingCategory ? (
                  "Update Category"
                ) : (
                  "Create Category"
                )}
              </Button>
              {isEditingCategory && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onEditCategory(null)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      {/* Categories List */}
      <div className="space-y-3">
        <div className="px-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Categories ({categoryAmount})
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your existing categories below.
          </p>
        </div>

        {categories.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                There are no categories yet. Create one to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-2">
            {categories.map((cat) => (
              <Card
                key={cat.id}
                className="hover:shadow-md transition-all duration-200 group"
              >
                <CardContent className="py-4 px-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        onClick={() => onEditCategory(cat)}
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDeleteCategory(cat.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryManager;