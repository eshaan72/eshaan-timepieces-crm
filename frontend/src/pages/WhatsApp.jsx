import { useEffect, useState } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';

export default function WhatsAppPage() {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'ONLY_VIEW';
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    api.get('/customers', { params: { limit: 200 } }).then(function (res) {
      const withWhatsapp = res.data.items.filter(function (c) {
        return c.whatsapp;
      });
      setCustomers(withWhatsapp);
      setLoading(false);
    });
  }, []);

  function buildWhatsappLink(number) {
    const digitsOnly = number.replace(/[^0-9]/g, '');
    return 'https://wa.me/' + digitsOnly;
  }

  const filtered = customers.filter(function (c) {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.whatsapp?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#09090B] flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-white text-2xl font-semibold mb-6">WhatsApp</h1>

        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={function (e) { setSearch(e.target.value); }}
            className="pl-9 bg-[#111111] border-white/10 text-white"
          />
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-lg divide-y divide-white/5">
          {loading ? (
            <p className="text-white/40 text-center py-8">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-white/40 text-center py-8">
              No customers with a WhatsApp number yet.
            </p>
          ) : (
            filtered.map(function (c) {
              return (
                <div key={c.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-white font-medium">{c.name}</p>
                    <p className="text-white/40 text-sm">{isReadOnly ? 'Hidden' : c.whatsapp}</p>
                  </div>
                  {!isReadOnly ? (
                    <a
                      href={buildWhatsappLink(c.whatsapp)}
                      target="whatsapp_tab"
                      rel="noreferrer"
                      className="flex items-center gap-2 bg-green-600/20 text-green-400 px-3 py-1.5 rounded-md text-sm hover:bg-green-600/30 transition-colors"
                    >
                      <MessageCircle size={14} />
                      Message
                    </a>
                  ) : (
                    <span className="text-white/40 text-xs">Read-only users cannot send messages.</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
