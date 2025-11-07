import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticketId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all available agents
    const { data: agents, error: agentsError } = await supabase
      .from('support_agents')
      .select('id, user_id, name, is_online')
      .eq('is_online', true);

    if (agentsError || !agents || agents.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No agents available',
        assigned: false 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get active workload for each agent (open tickets assigned to them)
    const { data: activeTickets } = await supabase
      .from('support_tickets')
      .select('assigned_agent_id')
      .eq('status', 'open')
      .not('assigned_agent_id', 'is', null);

    // Count workload per agent
    const workloadMap: Record<string, number> = {};
    activeTickets?.forEach(ticket => {
      const agentId = ticket.assigned_agent_id;
      if (agentId) {
        workloadMap[agentId] = (workloadMap[agentId] || 0) + 1;
      }
    });

    // Get ratings for each agent
    const agentIds = agents.map(a => a.user_id);
    const { data: ratingsData } = await supabase
      .from('support_ratings')
      .select(`
        rating,
        support_tickets!inner(assigned_agent_id)
      `)
      .in('support_tickets.assigned_agent_id', agentIds);

    // Calculate average ratings per agent
    const ratingsMap: Record<string, { avg: number; count: number }> = {};
    if (ratingsData) {
      agentIds.forEach((agentId: string) => {
        const agentRatings = ratingsData.filter(
          (r: any) => r.support_tickets?.assigned_agent_id === agentId
        );
        
        if (agentRatings.length > 0) {
          const sum = agentRatings.reduce((acc: number, r: any) => acc + r.rating, 0);
          ratingsMap[agentId] = {
            avg: sum / agentRatings.length,
            count: agentRatings.length
          };
        } else {
          // No ratings yet, give neutral score
          ratingsMap[agentId] = { avg: 3.5, count: 0 };
        }
      });
    }

    // Score each agent
    // Formula: (Rating * 2) - (Workload * 3) + 10
    // Higher score = better choice
    const scoredAgents = agents.map(agent => {
      const workload = workloadMap[agent.user_id] || 0;
      const rating = ratingsMap[agent.user_id]?.avg || 3.5;
      const score = (rating * 2) - (workload * 3) + 10;
      
      return {
        ...agent,
        workload,
        rating,
        score
      };
    });

    // Sort by score (highest first) and pick the best agent
    scoredAgents.sort((a, b) => b.score - a.score);
    const bestAgent = scoredAgents[0];

    console.log('Agent scores:', scoredAgents);
    console.log('Selected agent:', bestAgent.name, 'Score:', bestAgent.score);

    // Assign the agent to the ticket
    const { error: assignError } = await supabase
      .from('support_tickets')
      .update({
        assigned_agent_id: bestAgent.user_id,
        chat_mode: 'agent',
        agent_online: true
      })
      .eq('id', ticketId);

    if (assignError) {
      throw assignError;
    }

    return new Response(JSON.stringify({ 
      success: true,
      assigned: true,
      agentName: bestAgent.name,
      agentId: bestAgent.user_id,
      score: bestAgent.score
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in assign-best-agent:', error);
    return new Response(JSON.stringify({ 
      error: error?.message || 'Unknown error',
      assigned: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
