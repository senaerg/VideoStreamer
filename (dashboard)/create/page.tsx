import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import React, { cache } from 'react'
import PageClient from './PageClient'
import { connectToDatabase } from '@/lib/db'
import CategoryModel from '@/models/CategoryModel'
import { DryCleaning } from '@mui/icons-material'
import { AppCategory } from '@/types'

const getCategories = cache(async() => {
    try {
        await connectToDatabase()
        const result = await CategoryModel.find({})
        const categories: AppCategory[] = result.map((doc) => ({name: doc.name, id: doc._id.toString()}))
        return categories
    } catch (error) {
       return []
    }
})

const page = async() => {
    const session = await auth()
    if(!session) return redirect("/")
        const categories = await getCategories()
  return (
    <PageClient categories={categories} session={session}  />
  )
}

export default page
