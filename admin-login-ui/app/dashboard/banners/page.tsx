'use client'

import { useState, useEffect } from 'react'
import { Image as ImageIcon, Trash2, Edit2, Plus, Loader2 } from 'lucide-react'
import { getAllBanners, createBanner, updateBanner, deleteBanner } from '@/util/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface Banner {
  id: number
  image_url: string
  link: string
  position: string
  is_active: boolean
  created_at: string
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)
  
  // Form State
  const [imageUrl, setImageUrl] = useState('')
  const [link, setLink] = useState('')
  const [position, setPosition] = useState('0')
  const [isActive, setIsActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { toast } = useToast()

  const fetchBanners = async () => {
    try {
      setIsLoading(true)
      const res = await getAllBanners()
      if (res.data?.success) {
        setBanners(res.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch banners', error)
      toast({ title: 'Error', description: 'Failed to fetch banners' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const handleOpenDialog = (banner?: Banner) => {
    if (banner) {
      setSelectedBanner(banner)
      setImageUrl(banner.image_url)
      setLink(banner.link)
      setPosition(banner.position)
      setIsActive(banner.is_active)
    } else {
      setSelectedBanner(null)
      setImageUrl('')
      setLink('')
      setPosition('0')
      setIsActive(true)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedBanner(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      const data = { image_url: imageUrl, link, position, is_active: isActive }
      if (selectedBanner) {
        await updateBanner(selectedBanner.id, data)
        toast({ title: 'Success', description: 'Banner updated successfully' })
      } else {
        await createBanner(data)
        toast({ title: 'Success', description: 'Banner created successfully' })
      }
      setIsDialogOpen(false)
      fetchBanners()
    } catch (error) {
      console.error('Failed to save banner', error)
      toast({ title: 'Error', description: 'Failed to save banner' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedBanner) return
    try {
      await deleteBanner(selectedBanner.id)
      toast({ title: 'Success', description: 'Banner deleted successfully' })
      fetchBanners()
    } catch (error) {
      console.error('Failed to delete banner', error)
      toast({ title: 'Error', description: 'Failed to delete banner' })
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedBanner(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Banners & Thumbnails</h1>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
          <Plus className="size-4" />
          Add New Banner
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-slate-400" />
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
          No banners found. Click "Add New Banner" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map(banner => (
            <div key={banner.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
              <div className="h-48 bg-slate-100 relative group">
                {banner.image_url ? (
                  <img src={banner.image_url} alt={banner.link} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon className="size-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => handleOpenDialog(banner)} className="p-2 bg-white rounded-full text-slate-700 hover:text-blue-600 transition-colors">
                    <Edit2 className="size-4" />
                  </button>
                  <button onClick={() => { setSelectedBanner(banner); setIsDeleteDialogOpen(true); }} className="p-2 bg-white rounded-full text-slate-700 hover:text-red-600 transition-colors">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="truncate pr-4">
                    <h3 className="font-semibold text-slate-900 truncate">Link: {banner.link || 'N/A'}</h3>
                    <p className="text-sm text-slate-500">Position: {banner.position}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 ${banner.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                  <span>Created: {new Date(banner.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{selectedBanner ? 'Edit Banner' : 'Create New Banner'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="link">Destination Link</Label>
                <Input
                  id="link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="/product/some-product"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position">Position (Order)</Label>
                <Input
                  id="position"
                  type="number"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <Label htmlFor="is_active" className="cursor-pointer">Active Status</Label>
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                {selectedBanner ? 'Save Changes' : 'Create Banner'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the banner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
