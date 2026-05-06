function UserCard({ user }) {
  if (!user) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Customer</h3>
      <dl className="mt-2 grid grid-cols-1 gap-y-1 text-sm text-slate-700">
        <div><dt className="inline font-medium">Name:</dt> <dd className="inline">{user.full_name || '-'}</dd></div>
        <div><dt className="inline font-medium">Email:</dt> <dd className="inline break-all">{user.email || '-'}</dd></div>
        <div><dt className="inline font-medium">Phone:</dt> <dd className="inline">{user.phone || '-'}</dd></div>
        <div><dt className="inline font-medium">Address:</dt> <dd className="inline">{user.address || '-'}</dd></div>
        <div>
          <dt className="inline font-medium">Location:</dt>{' '}
          <dd className="inline">
            {[user.city, user.state, user.pincode].filter(Boolean).join(', ') || '-'}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default function OrderDetails({ order, allUserItems }) {
  if (!order) return null;

  const itemsToShow = allUserItems.length > 0 ? allUserItems : order.items || [];

  return (
    <section className="space-y-4 rounded-2xl bg-white p-4 shadow-md sm:p-6">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="break-all text-lg font-bold text-slate-900 sm:text-xl">Order: {order.order_number}</h2>
        <p className="text-sm text-emerald-600 font-bold">Total Amount: ₹{order.total_amount}</p>
      </div>

      <UserCard user={order.user} />

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Purchased Items ({itemsToShow.length})
        </h3>

        <div className="mt-3 space-y-3 sm:hidden">
          {itemsToShow.length ? (
            itemsToShow.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                {/* <p><span className="font-medium">Item ID:</span> {item.id}</p> */}
                {item.product_detail ? (
                  <>
                    <p><span className="font-medium">Product:</span> {item.product_detail.name}</p>
                    {/* {item.product_detail.photo && (
                      <img src={item.product_detail.photo} alt={item.product_detail.name} className="w-16 h-16 object-cover rounded mt-2" />
                    )} */}
                    <p><span className="font-medium">Expiry:</span> {item.product_detail.expiry}</p>
                    <p><span className="font-medium">Value:</span> {item.product_detail.value} {item.product_detail.unit}</p>
                    <p><span className="font-medium">Price:</span> ₹{item.price_at_purchase}</p>
                    {/* <p><span className="font-medium">Product Number:</span> {item.product_detail.product_number}</p> */}
                  </>
                ) : (
                  <p><span className="font-medium">Product:</span> {item.product}</p>
                )}
                <p><span className="font-medium">Qty:</span> {item.qty}</p>
                <p>
                  <span className="font-medium">Total:</span>{' '}
                  {item.qty} × ₹{item.price_at_purchase || 0} ={' '}
                  <span className="font-semibold text-emerald-600">
                    ₹{item.qty * (item.price_at_purchase || 0)}
                  </span>
                </p>
              </article>
            ))
          ) : (
            <p className="rounded-xl border border-slate-200 p-4 text-center text-sm text-slate-500">
              No items available.
            </p>
          )}
          <p className="text-sm text-slate-500 text-emerald-600 font-semibold">Total Amount: ₹{order.total_amount}</p>
        </div>

        <div className="mt-2 hidden overflow-x-auto sm:block">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-2 py-2">Product</th>
                <th className="px-2 py-2">Expiry</th>
                <th className="px-2 py-2">Value</th>
                <th className="px-2 py-2">Price</th>
                <th className="px-2 py-2">Qty</th>
                <th className="px-2 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {itemsToShow.length ? (
                itemsToShow.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 text-slate-700">
                    <td className="px-2 py-2">
                      {item.product_detail ? item.product_detail.name : item.product}
                    </td>
                    <td className="px-2 py-2">{item.product_detail?.expiry || '-'}</td>
                    <td className="px-2 py-2">
                      {item.product_detail ? `${item.product_detail.value} ${item.product_detail.unit}` : '-'}
                    </td>
                    <td className="px-2 py-2">₹{item.product_detail?.price || item.price_at_purchase}</td>
                    <td className="px-2 py-2">{item.qty}</td>
                    <td className="px-2 py-2">{' '}
                      ₹{item.price_at_purchase || 0} X {item.qty} ={' '}
                      <span className="font-semibold text-emerald-600">
                      ₹{item.qty * (item.price_at_purchase || 0)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-2 py-4 text-center text-slate-500">
                    No items available.
                  </td>
                </tr>
              )}
            </tbody>
            <br></br>
            <p className="text-sm text-emerald-600 font-semibold">Total Amount: ₹{order.total_amount}</p>
          </table>
        </div>
      </div>
    </section>
  );
}
