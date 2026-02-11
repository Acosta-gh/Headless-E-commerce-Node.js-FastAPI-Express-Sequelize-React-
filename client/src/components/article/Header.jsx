import {
  Heart,
  MessageCircle,
  ShoppingCart,
  Zap,
  Package,
  Truck,
  Shield,
  ChevronLeft,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ShareButton from "@/components/article/ShareButton";
import { Link } from "react-router-dom";

function normalizeIds(ids) {
  return (ids ?? []).map((id) => {
    const v = typeof id === "object" ? id?.userId ?? id?.id ?? id : id;
    return String(v);
  });
}

function userHasLiked(currentUserId, likeIds) {
  if (!currentUserId || !likeIds || likeIds.length === 0) return false;
  const normalized = normalizeIds(likeIds);
  return normalized.includes(String(currentUserId));
}

function Header({
  categories = [],
  title,
  author,
  onAddLike,
  publishedDate,
  onBack,
  likeIds,
  currentUserId,
  likeCount,
  commentAmount,
  handleScrollToComments,
  liked: likedProp,
  isLiking = false,
  // E-commerce props
  price,
  stock,
  sku,
  isBulky,
  shortDescription,
  galleryImages = [],
  selectedImage,
  setSelectedImage,
  quantity,
  setQuantity,
  handleAddToCart,
  handleBuyNow,
}) {
  const liked =
    typeof likedProp === "boolean"
      ? likedProp
      : userHasLiked(currentUserId, likeIds);

  const displayCategories = categories.slice(0, 10);
  const inStock = stock > 0;

  const formatPrice = (priceValue) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(priceValue);
  };

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= stock) {
      setQuantity(newQty);
    }
  };

  return (
    <header className="space-y-6">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Volver a productos
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
            {inStock && stock <= 5 && (
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="destructive">
                  Últimas {stock} unidades
                </Badge>
              </div>
            )}
            {isBulky && (
              <div className="absolute top-4 right-4 z-10">
                <Badge>
                  <Truck className="mr-1 h-3 w-3" />
                  Envío especial
                </Badge>
              </div>
            )}
            <img
              src={galleryImages[selectedImage]?.url || galleryImages[0]?.url}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail Gallery */}
          {galleryImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-md overflow-hidden border-2 ${
                    selectedImage === idx
                      ? "border-primary"
                      : "border-muted"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`Vista ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Product Info */}
        <div className="space-y-6">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {displayCategories.map((cat) => (
              <Link
                to={`/articles?category=${encodeURIComponent(cat.name)}`}
                key={cat.id}
              >
                <Badge className="bg-accent text-accent-foreground">
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold tracking-tight">
            {title}
          </h1>

          {/* SKU & Stock Status */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              SKU: <span className="font-mono font-medium text-foreground">{sku}</span>
            </span>
            <div className="h-4 w-px bg-border" />
            {inStock ? (
              <span className="flex items-center gap-2 text-green-600">
                <span className="h-2 w-2 bg-green-600 rounded-full" />
                En stock ({stock} disponibles)
              </span>
            ) : (
              <span className="flex items-center gap-2 text-destructive">
                <span className="h-2 w-2 bg-destructive rounded-full" />
                Sin stock
              </span>
            )}
          </div>

          {/* Short Description */}
          {shortDescription && (
            <p className="text-muted-foreground leading-relaxed">
              {shortDescription}
            </p>
          )}

          {/* Price */}
          <div className="border rounded-lg p-6 bg-muted/50">
            <div className="text-3xl font-bold">
              {formatPrice(price)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Precio sujeto a disponibilidad
            </p>
          </div>

          {/* Quantity Selector & Actions */}
          {inStock && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Cantidad:</span>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  variant="outline"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Agregar al carrito
                </Button>
                <Button
                  onClick={handleBuyNow}
                  size="lg"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Comprar ahora
                </Button>
              </div>
            </div>
          )}

          {!inStock && (
            <div className="border border-destructive/50 bg-destructive/10 rounded-lg p-4">
              <p className="text-sm font-medium text-center">
                Producto sin stock. Contáctanos para consultar disponibilidad.
              </p>
            </div>
          )}

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="text-center space-y-2">
              <div className="h-10 w-10 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Truck className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Envío a todo el país</p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-10 w-10 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Compra segura</p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-10 w-10 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Garantía oficial</p>
            </div>
          </div>

          {/* Social Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className={`rounded-full ${
                  liked ? "text-red-500" : ""
                }`}
                onClick={() => {
                  if (!isLiking) onAddLike(null);
                }}
                disabled={isLiking}
              >
                <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
                <span className="ml-2">{likeCount ?? 0}</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full"
                onClick={handleScrollToComments}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="ml-2">{commentAmount}</span>
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Compartir
              </span>
              <ShareButton url={window.location.href} />
            </div>
          </div>

          {/* Author Info */}
          <div className="bg-muted rounded-lg p-4 flex items-center gap-4">
            <Avatar className="h-10 w-10 outline">
              <AvatarImage
                src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${author?.username}`}
                alt={typeof author === "string" ? author : author?.username}
              />
              <AvatarFallback>
                {typeof author === "string" ? author : author?.username}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">
                Vendido por {typeof author === "string" ? author : author?.username}
              </p>
              <p className="text-xs text-muted-foreground">
                Publicado el {publishedDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;  