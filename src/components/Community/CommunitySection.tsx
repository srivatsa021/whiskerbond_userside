import React, { useState, useContext } from 'react';
import { PostCard } from './PostCard';
import { Button } from '../UI/Button';
import { SearchIcon, PlusIcon, FilterIcon } from 'lucide-react';
import { PetContext } from '../Pets/PetContext';
interface CommunitySectionProps {
  onLoginRequired: () => void;
}
export const CommunitySection = ({
  onLoginRequired
}: CommunitySectionProps) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // In a real app, this would be from auth state
  const {
    activePet
  } = useContext(PetContext);
  const categories = [{
    id: 'all',
    name: 'All Posts'
  }, {
    id: 'ask-vet',
    name: 'Ask a Vet'
  }, {
    id: 'pet-memes',
    name: 'Pet Memes'
  }, {
    id: 'adoption',
    name: 'Adoption'
  }, {
    id: 'lost-found',
    name: 'Lost & Found'
  }, {
    id: 'advice',
    name: 'Advice'
  }];
  // Sample post data
  const posts = [{
    id: '1',
    title: 'What food brands do you recommend for a senior cat with kidney issues?',
    content: "My 12-year-old tabby was recently diagnosed with early kidney disease. The vet recommended a prescription diet, but I'd like to hear from other cat parents who have dealt with this. What foods have worked well for your senior cats with similar issues?",
    author: {
      name: 'CatLover123',
      avatar: 'https://randomuser.me/api/portraits/women/43.jpg'
    },
    category: 'ask-vet',
    upvotes: 24,
    downvotes: 2,
    comments: 15,
    timeAgo: '2 hours ago',
    petType: 'Cat'
  }, {
    id: '2',
    title: "My dog's reaction to seeing me after a week-long trip",
    content: 'I was away for a business trip and this is how my golden retriever greeted me when I got home. Nothing beats this kind of love!',
    author: {
      name: 'DogDad42',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
    },
    category: 'pet-memes',
    upvotes: 152,
    downvotes: 3,
    comments: 28,
    timeAgo: '5 hours ago',
    image: 'https://images.unsplash.com/photo-1536809188428-e8ecf663d0be?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    petType: 'Dog'
  }, {
    id: '3',
    title: 'Looking to adopt: Two bonded cats need a forever home',
    content: "These two beautiful siblings (3 years old) need a new home as their owner is moving overseas. They're indoor cats, very affectionate, and must be adopted together. Located in Pawsome City. All vaccinations up to date.",
    author: {
      name: 'RescueVolunteer',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg'
    },
    category: 'adoption',
    upvotes: 87,
    downvotes: 0,
    comments: 42,
    timeAgo: '1 day ago',
    image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
    petType: 'Cat'
  }, {
    id: '4',
    title: 'LOST DOG: Brown Labrador missing in Central Park area',
    content: "Our 5-year-old chocolate lab, Max, got spooked by fireworks and ran away last night around 9 PM. He's wearing a blue collar with tags and is microchipped. Very friendly but might be scared. Please call the number on his tag if found!",
    author: {
      name: 'WorriedPetParent',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    category: 'lost-found',
    upvotes: 215,
    downvotes: 0,
    comments: 93,
    timeAgo: '10 hours ago',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    petType: 'Dog'
  }, {
    id: '5',
    title: 'Tips for introducing a new kitten to resident cat?',
    content: "We're bringing home a 12-week-old kitten next weekend, and we have a 4-year-old cat who has been an only pet until now. Any advice on making the introduction go smoothly? I've set up a separate room for the kitten but would love more specific tips.",
    author: {
      name: 'MultiCatHousehold',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg'
    },
    category: 'advice',
    upvotes: 42,
    downvotes: 1,
    comments: 37,
    timeAgo: '1 day ago',
    petType: 'Cat'
  }];
  // Filter posts based on active category and active pet
  const filteredPosts = posts.filter(post => {
    if (activeCategory !== 'all' && post.category !== activeCategory) return false;
    if (activePet && post.petType !== activePet.type) return false;
    return true;
  });
  const handleCreatePost = () => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }
    // Handle post creation logic
  };
  // For demo purposes, we'll show a login prompt instead of the actual content
  if (!isLoggedIn) {
    return <section className="py-12 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-700">
              <h2 className="text-3xl font-bold text-white mb-4">
                Join Our Pet Community
              </h2>
              <p className="text-gray-400 mb-6">
                Connect with fellow pet lovers, share stories, ask questions,
                and help others in our vibrant community.
              </p>
              <div className="mb-8">
                <img src="https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="Pet community" className="rounded-lg w-full h-auto" />
              </div>
              <div className="space-y-4">
                <Button size="lg" className="w-full" onClick={onLoginRequired}>
                  Login to Access Community
                </Button>
                <p className="text-sm text-gray-500">
                  New to WhiskerBond?{' '}
                  <button className="text-rose-500 font-medium" onClick={onLoginRequired}>
                    Create an account
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>;
  }
  return <section className="py-12 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            {activePet ? `${activePet.name}'s Community` : 'WhiskerBond Community'}
          </h2>
          <p className="text-gray-400 mt-2">
            Connect, share, and learn with fellow{' '}
            {activePet ? activePet.type.toLowerCase() : 'pet'} lovers
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-gray-900 rounded-lg shadow-md p-4 mb-4 border border-gray-700">
              <Button className="w-full mb-4" onClick={handleCreatePost}>
                <PlusIcon size={18} className="mr-2" />
                Create Post
              </Button>
              <div className="relative mb-4">
                <input type="text" placeholder="Search community..." className="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
              <div className="space-y-1">
                {categories.map(category => <button key={category.id} className={`w-full text-left px-3 py-2 rounded-lg ${activeCategory === category.id ? 'bg-rose-900 text-rose-100 font-medium' : 'text-gray-300 hover:bg-gray-800'}`} onClick={() => setActiveCategory(category.id)}>
                    {category.name}
                  </button>)}
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg shadow-md p-4 border border-gray-700">
              <h3 className="font-semibold text-white mb-3">
                Community Guidelines
              </h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• Be kind and respectful to others</li>
                <li>• No spam or self-promotion</li>
                <li>• Keep content pet-related</li>
                <li>• Report inappropriate content</li>
                <li>• No personal information sharing</li>
              </ul>
            </div>
          </div>
          {/* Main content */}
          <div className="lg:w-2/4">
            <div className="bg-gray-900 rounded-lg shadow-md p-4 mb-4 border border-gray-700">
              <div className="flex items-center space-x-2">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Your profile" className="w-10 h-10 rounded-full object-cover border border-gray-700" />
                <input type="text" placeholder={`Share something about ${activePet ? activePet.name : 'your pet'}...`} className="flex-grow px-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent" onClick={handleCreatePost} />
              </div>
            </div>
            {filteredPosts.length > 0 ? filteredPosts.map(post => <PostCard key={post.id} {...post} />) : <div className="bg-gray-900 rounded-lg shadow-md p-8 text-center border border-gray-700">
                <p className="text-gray-400 mb-4">
                  No posts found for {activePet?.name || 'this pet type'}.
                </p>
                <Button onClick={handleCreatePost}>
                  Create the First Post
                </Button>
              </div>}
            {filteredPosts.length > 0 && <div className="text-center mt-6">
                <Button variant="outline">Load More Posts</Button>
              </div>}
          </div>
          {/* Right sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-gray-900 rounded-lg shadow-md p-4 mb-4 border border-gray-700">
              <h3 className="font-semibold text-white mb-3">Trending Topics</h3>
              <ul className="space-y-3">
                {['#PetAdoption', '#RescueDogs', '#CatCare', '#PetTraining', '#VetAdvice'].map(tag => <li key={tag}>
                    <a href="#" className="text-rose-400 hover:text-rose-300 font-medium">
                      {tag}
                    </a>
                  </li>)}
              </ul>
            </div>
            <div className="bg-gray-900 rounded-lg shadow-md p-4 mb-4 border border-gray-700">
              <h3 className="font-semibold text-white mb-3">Active Members</h3>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="flex items-center space-x-2">
                    <img src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i * 10 + 2}.jpg`} alt="Member" className="w-8 h-8 rounded-full object-cover border border-gray-700" />
                    <div>
                      <span className="text-sm font-medium text-gray-300">
                        {['PetLover', 'DogWhisperer', 'CatMom', 'RescueHero', 'AnimalAdvocate'][i - 1]}
                      </span>
                      <div className="text-xs text-gray-500">
                        {Math.floor(Math.random() * 10) + 1} posts today
                      </div>
                    </div>
                  </div>)}
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-amber-900">
              <h3 className="font-semibold text-amber-300 mb-2">
                Upcoming Events
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-800 rounded-md p-3 border border-gray-700">
                  <span className="text-xs font-medium text-rose-400">
                    This Weekend
                  </span>
                  <h4 className="font-medium text-white">Pet Adoption Fair</h4>
                  <p className="text-xs text-gray-400">
                    Central Park, 10 AM - 4 PM
                  </p>
                </div>
                <div className="bg-gray-800 rounded-md p-3 border border-gray-700">
                  <span className="text-xs font-medium text-rose-400">
                    Next Tuesday
                  </span>
                  <h4 className="font-medium text-white">
                    Pet First Aid Workshop
                  </h4>
                  <p className="text-xs text-gray-400">
                    Community Center, 6 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};