
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, ListTodo } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">TaskHub</h1>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline">Log in</Button>
            </Link>
            <Link to="/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main>
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Manage your tasks <span className="text-indigo-600">efficiently</span>
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              A simple, intuitive task management system to help you stay organized and productive.
            </p>
            <div className="mt-8 flex justify-center">
              <Link to="/register">
                <Button size="lg" className="px-8 py-6 text-lg">Get Started for Free</Button>
              </Link>
            </div>
          </div>
          
          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                <div className="w-12 h-12 flex items-center justify-center rounded-md bg-indigo-100 text-indigo-600 mb-4">
                  <ListTodo className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Create Tasks</h3>
                <p className="mt-2 text-gray-500">
                  Easily create tasks with titles, descriptions, and due dates to keep track of your work.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                <div className="w-12 h-12 flex items-center justify-center rounded-md bg-amber-100 text-amber-600 mb-4">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Track Progress</h3>
                <p className="mt-2 text-gray-500">
                  Monitor the status of your tasks with to-do, in-progress, and completed categories.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                <div className="w-12 h-12 flex items-center justify-center rounded-md bg-green-100 text-green-600 mb-4">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Stay Organized</h3>
                <p className="mt-2 text-gray-500">
                  Filter and sort your tasks by status and due date to prioritize your work effectively.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} TaskHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
