import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { supabase } from '@/lib/supabaseClient.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';
import { toast } from 'sonner';

const AnnouncementBoard = () => {
  const { isSponsor } = useAuth();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    supabase.from('announcements').select('*').eq('active', true).order('created_at', { ascending: false })
      .then(({ data }) => setAnnouncements(data || []));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <span>Tablero de anuncios</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay anuncios disponibles</p>
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="p-4 bg-accent/50 rounded-lg border border-border">
                <h4 className="font-semibold text-accent-foreground mb-2">{a.title}</h4>
                <p className="text-sm text-accent-foreground/80 leading-relaxed">{a.content}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(a.created_at).toLocaleDateString('es-MX')}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnnouncementBoard;
