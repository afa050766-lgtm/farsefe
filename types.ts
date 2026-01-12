
export interface Fabric {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  tags: string[];
}

export interface CartItem extends Fabric {
  quantity: number;
}
