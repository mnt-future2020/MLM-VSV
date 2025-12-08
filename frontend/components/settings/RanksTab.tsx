"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, Award } from "lucide-react";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/api";

type Rank = {
  _id?: string;
  name: string;
  minPV: number;
  color: string;
  icon: string;
  benefits: string[];
  order: number;
};

export function RanksTab() {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch ranks
  useEffect(() => {
    fetchRanks();
  }, []);

  const fetchRanks = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/settings/ranks');
      if (response.data.success) {
        setRanks(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch ranks:', error);
      toast.error('Failed to load ranks', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = useCallback((index: number, field: string, value: any) => {
    setRanks((prev) =>
      prev.map((rank, i) =>
        i === index ? { ...rank, [field]: value } : rank
      )
    );
  }, []);

  const handleBenefitChange = useCallback((rankIndex: number, benefitIndex: number, value: string) => {
    setRanks((prev) =>
      prev.map((rank, i) => {
        if (i === rankIndex) {
          const newBenefits = [...rank.benefits];
          newBenefits[benefitIndex] = value;
          return { ...rank, benefits: newBenefits };
        }
        return rank;
      })
    );
  }, []);

  const addBenefit = (rankIndex: number) => {
    setRanks((prev) =>
      prev.map((rank, i) =>
        i === rankIndex
          ? { ...rank, benefits: [...rank.benefits, ''] }
          : rank
      )
    );
  };

  const removeBenefit = (rankIndex: number, benefitIndex: number) => {
    setRanks((prev) =>
      prev.map((rank, i) => {
        if (i === rankIndex) {
          const newBenefits = rank.benefits.filter((_, bi) => bi !== benefitIndex);
          return { ...rank, benefits: newBenefits };
        }
        return rank;
      })
    );
  };

  const addRank = () => {
    const maxOrder = ranks.reduce((max, rank) => Math.max(max, rank.order), 0);
    const newRank: Rank = {
      name: '',
      minPV: 0,
      color: '#6B7280',
      icon: '🏆',
      benefits: [''],
      order: maxOrder + 1,
    };
    setRanks([...ranks, newRank]);
  };

  const deleteRank = async (index: number) => {
    const rank = ranks[index];
    
    if (!rank._id) {
      // Not saved yet, just remove from state
      setRanks(ranks.filter((_, i) => i !== index));
      return;
    }

    if (!confirm(`Are you sure you want to delete the "${rank.name}" rank?`)) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/api/settings/ranks/${rank._id}`);
      if (response.data.success) {
        setRanks(response.data.data);
        toast.success('Rank deleted successfully');
      }
    } catch (error: any) {
      console.error('Failed to delete rank:', error);
      toast.error('Failed to delete rank', {
        description: error.response?.data?.message || 'Please try again',
      });
    }
  };

  const saveRanks = async () => {
    try {
      setSaving(true);
      const response = await axiosInstance.put('/api/settings/ranks', { ranks });
      if (response.data.success) {
        setRanks(response.data.data);
        toast.success('Ranks saved successfully!');
      }
    } catch (error: any) {
      console.error('Failed to save ranks:', error);
      toast.error('Failed to save ranks', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ranks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Rank Management</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure ranks based on PV points. Users will automatically be assigned ranks based on their total PV.
          </p>
        </div>
        <Button onClick={addRank} variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Rank
        </Button>
      </div>

      <div className="space-y-4">
        {ranks.map((rank, index) => (
          <div key={index} className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: rank.color + '20' }}
                >
                  {rank.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{rank.name || 'New Rank'}</h4>
                  <p className="text-sm text-muted-foreground">Minimum {rank.minPV} PV</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteRank(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Rank Name
                </Label>
                <Input
                  value={rank.name}
                  onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                  placeholder="e.g., Bronze, Silver, Gold"
                  className="h-10"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Minimum PV Points
                </Label>
                <Input
                  type="number"
                  value={rank.minPV}
                  onChange={(e) => handleFieldChange(index, 'minPV', Number(e.target.value))}
                  placeholder="0"
                  className="h-10"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Color (Hex)
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={rank.color}
                    onChange={(e) => handleFieldChange(index, 'color', e.target.value)}
                    className="h-10 w-20"
                  />
                  <Input
                    value={rank.color}
                    onChange={(e) => handleFieldChange(index, 'color', e.target.value)}
                    placeholder="#6B7280"
                    className="h-10 flex-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Icon (Emoji)
                </Label>
                <Input
                  value={rank.icon}
                  onChange={(e) => handleFieldChange(index, 'icon', e.target.value)}
                  placeholder="🏆"
                  className="h-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium text-foreground">
                  Benefits
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addBenefit(index)}
                  className="h-8 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Benefit
                </Button>
              </div>
              <div className="space-y-2">
                {rank.benefits.map((benefit, benefitIndex) => (
                  <div key={benefitIndex} className="flex gap-2">
                    <Input
                      value={benefit}
                      onChange={(e) => handleBenefitChange(index, benefitIndex, e.target.value)}
                      placeholder="e.g., 10% bonus on earnings"
                      className="h-9"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBenefit(index, benefitIndex)}
                      className="h-9 w-9 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {ranks.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
          <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Ranks Yet</h3>
          <p className="text-muted-foreground mb-4">Create your first rank to get started</p>
          <Button onClick={addRank} className="gap-2">
            <Plus className="w-4 h-4" />
            Add First Rank
          </Button>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-border">
        <Button
          onClick={saveRanks}
          disabled={saving}
          className="gap-2 bg-primary-500 hover:bg-primary-600 text-white"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Ranks
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
