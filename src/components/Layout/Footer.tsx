import React from 'react';
import { PawPrintIcon, InstagramIcon, FacebookIcon, TwitterIcon, MailIcon, PhoneIcon, MapPinIcon } from 'lucide-react';
export const Footer = () => {
  return <footer className="bg-gray-800 text-gray-300 border-t border-gray-700">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <PawPrintIcon className="h-8 w-8 text-rose-500 animate-tail-wag" />
              <span className="text-2xl font-bold text-white">
                Whisker<span className="text-amber-400">Bond</span>
              </span>
            </div>
            <p className="text-gray-400">
              Connecting pet lovers with quality products, services, and a
              vibrant community.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <InstagramIcon size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FacebookIcon size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <TwitterIcon size={20} />
              </a>
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {['Products', 'Services', 'Community', 'About Us', 'Contact', 'FAQs'].map(link => <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>)}
            </ul>
          </div>
          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Services</h3>
            <ul className="space-y-2">
              {['Pet Grooming', 'Training', 'Veterinary Care', 'Pet Walking', 'Pet Events', 'Adoption'].map(service => <li key={service}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {service}
                  </a>
                </li>)}
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPinIcon size={20} className="text-rose-500 flex-shrink-0 mt-1" />
                <span>123 Pet Street, Furry Lane, Pawsome City</span>
              </li>
              <li className="flex items-center space-x-3">
                <PhoneIcon size={20} className="text-rose-500 flex-shrink-0" />
                <span>(123) 456-7890</span>
              </li>
              <li className="flex items-center space-x-3">
                <MailIcon size={20} className="text-rose-500 flex-shrink-0" />
                <span>hello@whiskerbond.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 mt-8 border-t border-gray-700 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} WhiskerBond. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
};