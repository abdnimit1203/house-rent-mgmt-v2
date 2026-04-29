import Link from 'next/link';
import { Home as HomeIcon, Phone, Maximize, MapPin, ArrowRight } from 'lucide-react';
import { getPublicAdvertisements } from '@/services/advertisementService';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const ads = await getPublicAdvertisements();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl hover:opacity-80 transition-opacity">
            {/* <HomeIcon className="h-6 w-6" /> */}
            <img src="/logo.png" alt="ico" width={42} height={42} />
            <span>BariBhara</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />

            <Link 
              href="/login" 
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              Admin Login
            </Link>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Find Your Next Perfect Home.
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Discover beautifully curated rooms and apartments verified by our prestigious network of House Lords. Direct contact. No middleman.
          </p>
        </div>

        {/* Advertisements Feed */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Latest Available Rooms</h2>
          
          {ads.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-12 text-center shadow-sm">
              <HomeIcon className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No Rooms Available</h3>
              <p className="text-slate-500 dark:text-slate-400">All properties are currently occupied. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad: any) => (
                <div key={ad._id.toString()} className="group bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                  {/* Image Placeholder */}
                  <div className="relative h-48 w-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    {ad.imageUrl ? (
                      <img src={ad.imageUrl} alt="Room preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <HomeIcon className="h-12 w-12 opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase shadow-sm ${ad.type === 'sale' ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'}`}>
                        For {ad.type}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white flex-1 pr-4">
                        ৳{ad.price.toLocaleString()} {ad.type === 'rent' && <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ mo</span>}
                      </h3>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 mb-4 flex-1">
                      {ad.description || 'No detailed description provided by the landlord.'}
                    </p>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-5 pb-5 border-b dark:border-slate-700">
                      {ad.roomSize && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <Maximize className="h-4 w-4 shrink-0" />
                          <span className="truncate">{ad.roomSize}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">Verified Host</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {ad.houseLordId?.name?.charAt(0) || 'L'}
                        </div>
                        <div className="text-sm">
                          <p className="font-medium truncate max-w-[120px]">{ad.houseLordId?.name || 'Landlord'}</p>
                        </div>
                      </div>
                      
                      <a href={`tel:${ad.contactPhone}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                        <Phone className="h-3.5 w-3.5" />
                        Call
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
