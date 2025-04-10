import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ItemDetails as ItemDetailsType } from "@/types/lost-found";
import { format } from "date-fns";

interface ItemDetailsProps {
  item: ItemDetailsType;
  onContactClick: () => void;
}

const ItemDetails: React.FC<ItemDetailsProps> = ({ item, onContactClick }) => {
  const formattedDate = format(new Date(item.date), "MMMM d, yyyy");

  return (
    <Card className="w-full">
      <div className="relative">
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-64 object-cover rounded-t-lg"
        />
        <Badge 
          className={`absolute top-2 right-2 ${
            item.status === "lost" 
              ? "bg-red-500 hover:bg-red-600" 
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {item.status === "lost" ? "Lost" : "Found"}
        </Badge>
      </div>

      <CardHeader>
        <CardTitle className="text-xl">{item.title}</CardTitle>
        <CardDescription>
          {item.category} • {item.location} • {formattedDate}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-1">Description</h3>
          <p className="text-gray-600">{item.description}</p>
        </div>

        <div>
          <h3 className="font-medium mb-1">Contact Information</h3>
          <p className="text-gray-600">
            Email: {item.contactEmail || "Not provided"}
            {item.contactPhone && <><br />Phone: {item.contactPhone}</>}
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full bg-lostfound-primary hover:bg-lostfound-secondary"
          onClick={onContactClick}
        >
          {item.status === "lost" ? "Contact Finder" : "Contact Owner"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ItemDetails;
