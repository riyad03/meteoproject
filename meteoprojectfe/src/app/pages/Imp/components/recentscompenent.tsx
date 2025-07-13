import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";  



export default function RecentsComponent  () {
 return(
        
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Récents</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Filtrer
                </Button>
                <Input
                  type="search"
                  placeholder="Chercher"
                  className="w-full max-w-xs rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 dark:focus:border-gray-400"
                />
              </div>
            </div>
            
 );
}