# Dark Mode Implementation Guide - Profile & Mentor/Mentee Pages

## ✅ COMPLETED FILES

### 1. MenteeProfilePage.tsx - COMPLETE
- All backgrounds, cards, and containers updated
- Password change form with dark inputs
- Status badges with proper dark mode colors
- Contract download section
- Loading skeletons
- Error states

### 2. MentorProfilePage.tsx - PARTIALLY COMPLETE
- Loading skeleton - ✅ Complete
- Error states - ✅ Complete
- Profile header - ✅ Complete
- Status badges function - ✅ Complete
- **REMAINING**: Forms section, personal information cards, password inputs, contract section

## 🔄 REMAINING FILES TO UPDATE

### 3. MentorsPage.tsx
### 4. MentorDetailPage.tsx
### 5. MentorMenteesPage.tsx
### 6. MentorMenteeDetailPage.tsx

## EXACT PATTERN TO APPLY

### Main Container
```tsx
// FROM:
className="min-h-screen bg-[#F8F8F8]"

// TO:
className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors"
```

### White Cards/Backgrounds
```tsx
// FROM:
className="bg-white rounded-xl shadow-sm p-6"

// TO:
className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors"
```

### Headings (h1, h2, h3)
```tsx
// FROM:
className="text-2xl font-bold text-gray-900"

// TO:
className="text-2xl font-bold text-gray-900 dark:text-white"
```

### Body Text
```tsx
// FROM:
className="text-gray-600"

// TO:
className="text-gray-600 dark:text-gray-300"
```

### Muted/Label Text
```tsx
// FROM:
className="text-sm text-gray-500"

// TO:
className="text-sm text-gray-500 dark:text-gray-400"
```

### Borders
```tsx
// FROM:
className="border border-gray-200"

// TO:
className="border border-gray-200 dark:border-gray-700"
```

### Gray Backgrounds (nested)
```tsx
// FROM:
className="bg-gray-50"

// TO:
className="bg-gray-50 dark:bg-gray-900 transition-colors"
```

### Teal/Brand Text
```tsx
// FROM:
className="text-[#008080]"

// TO:
className="text-[#008080] dark:text-teal-400"
```

### Teal/Brand Background
```tsx
// FROM:
className="bg-[#008080]"

// TO:
className="bg-[#008080] dark:bg-teal-600 transition-colors"
```

### Links & Hover States
```tsx
// FROM:
className="text-[#008080] hover:text-teal-700"

// TO:
className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
```

### Buttons
```tsx
// FROM:
className="bg-[#008080] text-white hover:bg-teal-700"

// TO:
className="bg-[#008080] dark:bg-teal-600 text-white hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors"
```

### Form Inputs
```tsx
// FROM:
className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"

// TO:
className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
```

### Status Badges (Green - Approved/Active)
```tsx
// FROM:
'bg-green-100 text-green-800 border-green-200'

// TO:
'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
```

### Status Badges (Yellow - Pending)
```tsx
// FROM:
'bg-yellow-100 text-yellow-800 border-yellow-200'

// TO:
'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
```

### Status Badges (Red - Rejected/Inactive)
```tsx
// FROM:
'bg-red-100 text-red-800 border-red-200'

// TO:
'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
```

### Status Badges (Blue)
```tsx
// FROM:
'bg-blue-100 text-blue-800 border-blue-200'

// TO:
'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
```

### Status Badges (Gray - Default)
```tsx
// FROM:
'bg-gray-100 text-gray-800 border-gray-200'

// TO:
'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
```

### Table Headers
```tsx
// FROM:
className="bg-gray-50"

// TO:
className="bg-gray-50 dark:bg-gray-800 transition-colors"
```

### Table Rows
```tsx
// FROM:
className="hover:bg-gray-50"

// TO:
className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
```

### Skeleton Loaders
```tsx
// FROM:
className="bg-gray-200 animate-pulse"

// TO:
className="bg-gray-200 dark:bg-gray-700 animate-pulse"
```

### Icons in Dark Backgrounds
```tsx
// FROM:
className="text-gray-400"

// TO:
className="text-gray-400 dark:text-gray-500"
```

## KEY SECTIONS TO UPDATE IN EACH FILE

1. **Main container** - Add `dark:bg-gray-950`
2. **All white cards** - Add `dark:bg-gray-800 dark:shadow-gray-900/30`
3. **All headings** - Add `dark:text-white`
4. **All body text** - Add `dark:text-gray-300`
5. **All labels** - Add `dark:text-gray-400`
6. **All borders** - Add `dark:border-gray-700`
7. **All gray backgrounds** - Add `dark:bg-gray-900`
8. **All teal text** - Add `dark:text-teal-400`
9. **All teal backgrounds** - Add `dark:bg-teal-600`
10. **All hover states** - Add dark variants
11. **All form inputs** - Add full dark mode classes
12. **All status badges** - Add dark variants
13. **All loading skeletons** - Add `dark:bg-gray-700`
14. **Add `transition-colors`** to all color-changing elements

## COMPLETION STATUS

- ✅ MenteeProfilePage.tsx - 100% Complete
- 🔄 MentorProfilePage.tsx - 60% Complete (header, skeletons, error states done; forms remaining)
- ⏳ MentorsPage.tsx - 0% Complete
- ⏳ MentorDetailPage.tsx - 0% Complete
- ⏳ MentorMenteesPage.tsx - 0% Complete
- ⏳ MentorMenteeDetailPage.tsx - 0% Complete
