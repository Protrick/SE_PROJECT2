import React from 'react'

const AppliedTeams = () => {
  return (
    <div className="min-h-screen pt-50 pb-12">
      <div className="max-w-7xlmx-auto px-4 sm:px-6 lg:px-8">
       

        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden shadow-lg rounded-lg border-2 border-indigo-200">
          <div className="px-6 py-8 sm:p-8 text-center">
            <div className="relative">
              <svg
                className="mx-auto h-16 w-16 text-indigo-600 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d=" M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full animate-ping"></div>
            </div>

            <h3 className="mt-6 text-2xl font-bold text-gray-900">📧 Check Your Emails to Get Up to Date!</h3>
            <div className="mt-4 space-y-3">
              <p className="text-lg text-indigo-700 font-semibold">
                Important application updates are sent directly to your email
              </p>
              <p className="text-sm text-gray-600">
                Team creators will contact you via email for any status changes, interviews, or acceptance notifications.
              </p>
              <p className="text-sm text-gray-600">
                Make sure to check your inbox (and spam folder) regularly for the latest updates on your applications.
              </p>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-center">
                <svg className="h-5 w-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-yellow-800">
                  Don't forget to check your spam/junk folder too!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppliedTeams
