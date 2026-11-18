import { memo } from 'react';
import { useCart } from '../context/CartContext.jsx';

function MenuCard({ item }) {
  const { add, list } = useCart();
  const inCart = list.find((i) => i.id === item.id)?.qty || 0;
  return (
    <article className="card">
      <span className="emoji" aria-hidden="true">{item.emoji}</span>
      <h3><span>{item.name}</span><span className="price">₹{item.price}</span></h3>
      <p>{item.description}</p>
      <div className="card-foot">
        <span className={`tag ${item.veg ? 'veg' : 'nonveg'}`}>{item.veg ? 'Veg' : 'Non-veg'}</span>
        <button className="add-btn" type="button" onClick={() => add(item)} aria-label={`Add ${item.name} to cart`}>
          {inCart ? `Add more (${inCart})` : '+ Add'}
        </button>
      </div>
    </article>
  );
}

export default memo(MenuCard);
