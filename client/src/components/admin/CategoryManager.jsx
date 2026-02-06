import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2, Edit2, Plus, X } from "lucide-react";

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
    <div className="grid gap-4 lg:grid-cols-[400px_1fr]">
      {/* Form Card - Fixed width sidebar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              {isEditingCategory ? (
                <>
                  <Edit2 className="w-4 h-4" />
                  Edit Category
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  New Category
                </>
              )}
            </span>
            {isEditingCategory && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditCategory(null)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={
              isEditingCategory ? onEditCategorySubmit : onCategorySubmit
            }
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor="cat-name" className="text-xs font-medium">
                Name
              </Label>
              <Input
                id="cat-name"
                name="name"
                placeholder="Technology, Health..."
                value={categoryForm.name}
                onChange={onCategoryFormChange}
                required
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-desc" className="text-xs font-medium">
                Description
              </Label>
              <Textarea
                id="cat-desc"
                name="description"
                placeholder="Brief description..."
                value={categoryForm.description}
                onChange={onCategoryFormChange}
                rows={3}
                className="resize-none text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={categoriesLoading}
              className="w-full h-9"
              size="sm"
            >
              {categoriesLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2" />
                  {isEditingCategory ? "Updating..." : "Creating..."}
                </>
              ) : isEditingCategory ? (
                "Update"
              ) : (
                "Create Category"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Categories List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">
            All Categories ({categoryAmount})
          </h3>
        </div>

        {categories.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No categories yet. Create one to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Card
                key={cat.id}
                className="hover:shadow-sm transition-all duration-200 group"
              >
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {cat.name}
                      </h4>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          onClick={() => onEditCategory(cat)}
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteCategory(cat.id)}
                          className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {cat.description}
                      </p>
                    )}
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