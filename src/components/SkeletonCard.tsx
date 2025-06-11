"use client"

import type React from "react"

export const SkeletonCard: React.FC = () => {
  return (
    <div className="card h-full flex flex-col overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="skeleton h-48 w-full"></div>

      {/* Content Skeleton */}
      <div className="p-4 flex flex-col flex-grow space-y-3">
        {/* Rating Skeleton */}
        <div className="flex items-center space-x-2">
          <div className="skeleton h-3 w-20"></div>
          <div className="skeleton h-3 w-8"></div>
        </div>

        {/* Title Skeleton */}
        <div className="skeleton h-5 w-3/4"></div>

        {/* Description Skeleton */}
        <div className="space-y-2 flex-grow">
          <div className="skeleton h-3 w-full"></div>
          <div className="skeleton h-3 w-2/3"></div>
        </div>

        {/* Price and Button Skeleton */}
        <div className="flex items-center justify-between pt-2">
          <div className="skeleton h-6 w-16"></div>
          <div className="skeleton h-9 w-20 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}
