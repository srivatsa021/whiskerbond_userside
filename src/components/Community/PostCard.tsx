import React from 'react';
import { MessageSquareIcon, ThumbsUpIcon, ThumbsDownIcon, ShareIcon, BookmarkIcon } from 'lucide-react';
interface PostCardProps {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  timeAgo: string;
  image?: string;
  petType?: string;
}
export const PostCard = ({
  id,
  title,
  content,
  author,
  category,
  upvotes,
  downvotes,
  comments,
  timeAgo,
  image,
  petType
}: PostCardProps) => {
  return <div className="bg-gray-900 rounded-lg shadow-md overflow-hidden mb-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="p-4">
        <div className="flex items-center mb-3">
          <img src={author.avatar} alt={author.name} className="w-8 h-8 rounded-full object-cover mr-2 border border-gray-700" />
          <div>
            <span className="font-medium text-white">{author.name}</span>
            <div className="flex items-center text-xs text-gray-500">
              <span>{timeAgo}</span>
              <span className="mx-1">•</span>
              <span className="text-rose-400">{category}</span>
              {petType && <>
                  <span className="mx-1">•</span>
                  <span className="bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded-full text-xs">
                    {petType}
                  </span>
                </>}
            </div>
          </div>
        </div>
        <h3 className="font-semibold text-lg text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-3 line-clamp-3">{content}</p>
        {image && <div className="mb-3 rounded-lg overflow-hidden border border-gray-700">
            <img src={image} alt={title} className="w-full h-auto object-cover" />
          </div>}
        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
          <div className="flex items-center space-x-4">
            <button className="flex items-center text-gray-400 hover:text-rose-400 transition-colors">
              <ThumbsUpIcon size={18} className="mr-1" />
              <span className="text-sm">{upvotes}</span>
            </button>
            <button className="flex items-center text-gray-400 hover:text-rose-400 transition-colors">
              <ThumbsDownIcon size={18} className="mr-1" />
              <span className="text-sm">{downvotes}</span>
            </button>
            <button className="flex items-center text-gray-400 hover:text-rose-400 transition-colors">
              <MessageSquareIcon size={18} className="mr-1" />
              <span className="text-sm">{comments}</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-1 text-gray-400 hover:text-rose-400 transition-colors">
              <ShareIcon size={18} />
            </button>
            <button className="p-1 text-gray-400 hover:text-rose-400 transition-colors">
              <BookmarkIcon size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>;
};