import { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Play, Award, DollarSign, BookOpen, UserPlus, ChevronRight, Loader } from 'lucide-react';
import { publicApi, fixUrl } from '../services/api';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  difficulty: string;
  modulesCount: number;
  whatYouLearn: string[];
}

export default function Landing() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [subscriptionPrice, setSubscriptionPrice] = useState(5000);

  useEffect(() => {
    publicApi.getCourses()
      .then(res => setCourses(res.data))
      .catch(() => {})
      .finally(() => setCoursesLoading(false));

    publicApi.getSettings()
      .then(res => { if (res.data.subscriptionPrice) setSubscriptionPrice(res.data.subscriptionPrice); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <img src={logo} alt="Selebration" className="h-10 w-auto object-contain" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#courses" className="text-gray-300 hover:text-white transition-colors">Courses</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="#affiliate" className="text-gray-300 hover:text-white transition-colors">Earn</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-300 hover:text-white hidden sm:block">Login</Link>
            <Link to="/register" className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold px-4 py-2 rounded-lg">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-green-500/10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full mb-6 border border-green-500/30">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Join 10,000+ Nigerians Earning Online
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Learn to Earn Online
              <span className="text-amber-500 block mt-2">While You Learn</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Master profitable digital skills through our video courses and simultaneously build your income through our revolutionary affiliate program. Start for free, upgrade when you're ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/register" className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25">
                Start 7-Day Free Trial <ArrowRight size={20} />
              </Link>
              <a href="#courses" className="border border-gray-600 hover:border-gray-500 px-8 py-4 rounded-lg text-lg flex items-center justify-center gap-2">
                <Play size={20} /> Explore Courses
              </a>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <Check className="text-green-500" size={20} />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-green-500" size={20} />
                <span>{coursesLoading ? '...' : `${courses.length || 'Professional'}`} Courses</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-green-500" size={20} />
                <span>Earn while learning</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-4 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Selliberation Works</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our unique platform combines quality education with earning opportunities. Here's how you can transform your financial future.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <UserPlus className="text-white" size={32} />
              </div>
              <div className="text-amber-500 font-bold text-sm mb-2">STEP 1</div>
              <h3 className="text-xl font-bold mb-3">Sign Up Free</h3>
              <p className="text-gray-400">
                Register with your name, email, and phone number. No payment required for the 7-day free trial. Get instant access to Module 1 of all courses.
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-bl-full"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <BookOpen className="text-white" size={32} />
              </div>
              <div className="text-green-500 font-bold text-sm mb-2">STEP 2</div>
              <h3 className="text-xl font-bold mb-3">Learn & Grow</h3>
              <p className="text-gray-400">
                Access quality video courses taught by experts. Learn practical skills in WhatsApp monetization, affiliate marketing, digital reselling, and more.
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <DollarSign className="text-white" size={32} />
              </div>
              <div className="text-blue-500 font-bold text-sm mb-2">STEP 3</div>
              <h3 className="text-xl font-bold mb-3">Earn Rewards</h3>
              <p className="text-gray-400">
                Share your referral link and earn up to 65% commission when your referrals subscribe. The more you share, the more you earn!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Courses</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {coursesLoading ? 'Our' : courses.length > 0 ? `${['One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten'][courses.length - 1] ?? courses.length}` : 'No'} comprehensive {courses.length === 1 ? 'course' : 'courses'} designed to take you from beginner to earning. Start with free modules, upgrade when you're ready.
            </p>
          </div>

          {coursesLoading ? (
            <div className="flex justify-center py-16">
              <Loader className="animate-spin text-amber-500" size={36} />
            </div>
          ) : courses.length === 0 ? (
            <p className="text-center text-gray-500 py-16">No courses available yet. Check back soon!</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div key={course.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-amber-500/50 transition-all group hover:shadow-xl hover:shadow-amber-500/10">
                  <div className="relative h-48 overflow-hidden bg-gray-700">
                    {course.thumbnail ? (
                      <img src={fixUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="text-gray-500" size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Free Module Available
                      </span>
                    </div>
                    {course.difficulty && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-gray-900/80 text-gray-300 text-xs px-2 py-1 rounded-full">{course.difficulty}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <BookOpen size={16} />
                      <span>{course.modulesCount} Module{course.modulesCount !== 1 ? 's' : ''}</span>
                      {course.category && <><span className="mx-1">•</span><span>{course.category}</span></>}
                    </div>
                    <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                    <Link to="/register" className="text-amber-500 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      Start Learning <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Affordable Pricing</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Start completely free. Upgrade when you're ready to unlock all content and maximize your earning potential.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold mb-2">Free Trial</h3>
                <div className="text-4xl font-bold text-white mb-1">₦0</div>
                <p className="text-gray-400">7 days free</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                  <span>Access to Module 1 of all courses</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                  <span>Introduction videos</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                  <span>Basic WhatsApp Monetization</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                  <span>Affiliate program access</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                  <span>Community support</span>
                </li>
              </ul>
              <Link to="/register" className="block w-full border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-gray-900 font-bold py-3 rounded-lg text-center transition-colors">
                Start Free Trial
              </Link>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-8 relative">
              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                POPULAR
              </div>
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold mb-2 text-gray-900">Premium</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">₦{subscriptionPrice.toLocaleString()}</div>
                <p className="text-gray-800/70">per month</p>
              </div>
              <ul className="space-y-4 mb-8 text-gray-900">
                <li className="flex items-center gap-3">
                  <Check className="flex-shrink-0" size={20} />
                  <span className="font-semibold">All 5 courses unlimited access</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="flex-shrink-0" size={20} />
                  <span className="font-semibold">All modules & lessons</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="flex-shrink-0" size={20} />
                  <span className="font-semibold">Advanced strategies</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="flex-shrink-0" size={20} />
                  <span className="font-semibold">Priority support</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="flex-shrink-0" size={20} />
                  <span className="font-semibold">Full affiliate commission</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="flex-shrink-0" size={20} />
                  <span className="font-semibold">Certificate of completion</span>
                </li>
              </ul>
              <Link to="/register" className="block w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-lg text-center transition-colors">
                Subscribe Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="affiliate" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Earn While You Learn with Our 
                <span className="text-amber-500"> 6-Level Affiliate Program</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Share Selliberation with your network and earn commissions at 6 levels deep. When your referrals subscribe, you earn. When their referrals subscribe, you still earn!
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { level: 'Level 1', rate: '65%', amount: '₦3,250', color: 'amber' },
                  { level: 'Level 2', rate: '15%', amount: '₦750', color: 'green' },
                  { level: 'Level 3', rate: '5%', amount: '₦250', color: 'blue' },
                  { level: 'Level 4', rate: '3%', amount: '₦150', color: 'purple' },
                  { level: 'Level 5', rate: '2%', amount: '₦100', color: 'red' },
                  { level: 'Level 6', rate: '1%', amount: '₦50', color: 'gray' },
                ].map((item, i) => (
                  <div key={i} className={`bg-gray-800 p-4 rounded-xl border border-gray-700`}>
                    <div className="text-2xl font-bold text-amber-500">{item.rate}</div>
                    <div className="text-sm text-gray-400">{item.level}</div>
                    <div className="text-xs text-gray-500">{item.amount}/month</div>
                  </div>
                ))}
              </div>

              <Link to="/register" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-6 py-3 rounded-lg">
                Start Earning Today <ArrowRight size={20} />
              </Link>
            </div>

            <div className="relative">
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                <h3 className="text-xl font-bold mb-6 text-center">Example Earnings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 font-bold">A</div>
                      <span>Referral A subscribes</span>
                    </div>
                    <span className="text-green-500 font-bold">+₦3,250/mo</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg ml-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 font-bold">B</div>
                      <span>Ref B subscribes</span>
                    </div>
                    <span className="text-green-500 font-bold">+₦750/mo</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg ml-16">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 font-bold">C</div>
                      <span>Ref C subscribes</span>
                    </div>
                    <span className="text-green-500 font-bold">+₦250/mo</span>
                  </div>
                  <div className="border-t border-gray-600 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Your Monthly Earnings</span>
                      <span className="text-2xl font-bold text-green-500">₦4,250/mo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-r from-amber-500/10 via-green-500/10 to-blue-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <Award className="mx-auto text-amber-500 mb-6" size={48} />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Life?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of Nigerians who are already earning online while building valuable skills. Your journey to financial freedom starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg shadow-lg shadow-amber-500/25">
              Get Started for Free
            </Link>
            <Link to="/login" className="border border-gray-600 hover:border-gray-500 px-8 py-4 rounded-lg text-lg">
              Already a Member? Login
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '10,000+', label: 'Active Members' },
              { number: '₦50M+', label: 'Commissions Paid' },
              { number: '5', label: 'Professional Courses' },
              { number: '24/7', label: 'Support Available' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-bold text-amber-500 mb-2">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <Link to="/" className="text-2xl font-bold">
                <span className="text-amber-500">Sell</span><span className="text-white">iberation</span>
              </Link>
              <p className="text-gray-500 mt-2">Part of Digital World Tech Academy</p>
            </div>
            <div className="flex gap-6 text-gray-400">
              <a href="#" className="hover:text-white">Terms</a>
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Contact</a>
            </div>
          </div>
          <div className="text-center text-gray-500 mt-8 pt-8 border-t border-gray-800">
            &copy; 2026 Selliberation. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
