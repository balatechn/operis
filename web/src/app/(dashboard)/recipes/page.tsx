'use client';
import { useQuery } from '@tanstack/react-query';
import { FlaskConical, Plus } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';

export default function RecipesPage() {
  const { data: recipes } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => api.get('/recipes').then((r) => r.data),
  });

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Recipes / BOM" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{recipes?.length ?? 0} recipes defined</p>
          <Button size="sm"><Plus className="w-4 h-4" /> New Recipe</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {recipes?.map((recipe: any) => (
            <Card key={recipe.id} className="space-y-3 cursor-pointer hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{recipe.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">v{recipe.version} • {recipe.batchSize} {recipe.batchUnit}</p>
                </div>
                <FlaskConical className="w-5 h-5 text-indigo-400" />
              </div>
              {recipe.description && <p className="text-xs text-gray-500 line-clamp-2">{recipe.description}</p>}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{recipe.ingredients?.length} ingredients</span>
                <span className="font-semibold text-indigo-600">{recipe.costPerBatch ? formatCurrency(recipe.costPerBatch) : 'N/A'} / batch</span>
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="ghost" className="flex-1">View BOM</Button>
                <Button size="sm" variant="secondary" className="flex-1">Check Stock</Button>
              </div>
            </Card>
          ))}
          {!recipes?.length && (
            <div className="col-span-3 py-16 text-center text-gray-400">
              <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No recipes yet. Define your first Bill of Materials.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
