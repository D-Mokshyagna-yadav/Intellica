import { useState, useEffect } from 'react';
import { Headphones, MessageCircle, Book, AlertCircle, Plus } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function CustomizationSupportCenter() {
  const [activeTab, setActiveTab] = useState('support');
  const [tickets, setTickets] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '', category: '' });

  const categories = ['Bug Report', 'Feature Request', 'General Question', 'Account Issue', 'Technical Support'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ticketsData, faqsData] = await Promise.all([
          apiFetch('/support/tickets').catch(() => []),
          apiFetch('/support/faqs').catch(() => []),
        ]);
        setTickets(ticketsData || []);
        setFaqs(faqsData || []);
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load support data' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.description || !newTicket.category) {
      showToast({ type: 'warning', message: 'Please fill all fields' });
      return;
    }

    try {
      await apiFetch('/support/tickets', {
        method: 'POST',
        body: JSON.stringify(newTicket),
      });
      showToast({ type: 'success', message: 'Support ticket created successfully' });
      setNewTicket({ subject: '', description: '', category: '' });
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to create ticket' });
    }
  };

  if (loading) return <LoadingState message="Loading support center..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2 flex items-center gap-2">
          <Headphones className="text-primary" /> Support & Customization Center
        </h1>
        <p className="text-on-surface-variant">Get help, report issues, and request features</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-subtle">
        <button onClick={() => setActiveTab('support')} className={`px-6 py-3 font-medium border-b-2 ${activeTab === 'support' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}>
          Support Tickets
        </button>
        <button onClick={() => setActiveTab('faqs')} className={`px-6 py-3 font-medium border-b-2 ${activeTab === 'faqs' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}>
          FAQs & Documentation
        </button>
        <button onClick={() => setActiveTab('customize')} className={`px-6 py-3 font-medium border-b-2 ${activeTab === 'customize' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}>
          Customization Requests
        </button>
      </div>

      {/* Support Tickets Tab */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-subtle p-6">
            <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <Plus /> Create New Ticket
            </h2>
            <div className="space-y-3">
              <input type="text" placeholder="Subject" value={newTicket.subject} onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-subtle focus:outline-none focus:border-primary" />
              <select value={newTicket.category} onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-subtle bg-white focus:outline-none focus:border-primary">
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <textarea placeholder="Describe your issue..." value={newTicket.description} onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-subtle focus:outline-none focus:border-primary" rows={4} />
              <button onClick={handleCreateTicket} className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">
                Submit Ticket
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface">Your Tickets</h2>
            {tickets.map((ticket) => (
              <div key={ticket._id} className="bg-white rounded-lg border border-subtle p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-on-surface">{ticket.subject}</h3>
                    <p className="text-sm text-on-surface-variant">{ticket.category}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${ticket.status === 'resolved' ? 'bg-success/10 text-success' : ticket.status === 'in-progress' ? 'bg-primary/10 text-primary' : 'bg-yellow-100 text-yellow-800'}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant mb-2">{ticket.description}</p>
                <p className="text-xs text-on-surface-variant">Created: {new Date(ticket.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQs Tab */}
      {activeTab === 'faqs' && (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0" size={24} />
            <div>
              <p className="font-bold text-blue-900">Quick Help</p>
              <p className="text-sm text-blue-800">Check our FAQs below or read the full documentation</p>
            </div>
          </div>

          {faqs.map((faq, idx) => (
            <details key={idx} className="bg-white rounded-lg border border-subtle group">
              <summary className="px-6 py-4 cursor-pointer font-bold text-on-surface flex items-center justify-between hover:bg-surface-container-low">
                <span className="flex items-center gap-2">
                  <Book size={18} className="text-primary" /> {faq.question}
                </span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-4 text-on-surface-variant border-t border-subtle">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      )}

      {/* Customization Requests Tab */}
      {activeTab === 'customize' && (
        <div className="bg-white rounded-lg border border-subtle p-6">
          <h2 className="text-lg font-bold text-on-surface mb-4">Feature & Customization Requests</h2>
          <div className="space-y-3">
            <p className="text-on-surface-variant mb-4">Have a feature idea or need customization? Submit your request here and our team will review it.</p>
            <input type="text" placeholder="Feature Title" className="w-full px-4 py-2 rounded-lg border border-subtle focus:outline-none focus:border-primary" />
            <textarea placeholder="Describe the feature or customization..." className="w-full px-4 py-2 rounded-lg border border-subtle focus:outline-none focus:border-primary" rows={4} />
            <button className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">
              Submit Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
