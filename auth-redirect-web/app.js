const SUPABASE_URL = "https://rgucydqdqfwjnkveibhr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_c9elGg8hW0PlxkDZdIgWVQ_TpIHBcSt";
const GROQ_API_KEY = ""; // Removed for security. Add via environment variables or a secure vault.

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let currentProfile = null;
let currentMood = "Okay";
let journalEntries = [];

const SYSTEM_PROMPT = `You are Serene, a supportive mental health companion. 
Your goal is to provide a safe, non-judgmental space for users to talk.

GUIDELINES FOR INTERACTION:
1. **BE EXTREMELY CONCISE.** Limit your responses to a maximum of 2-3 sentences.
2. Listen actively, show empathy, and validate feelings in as few words as possible.
3. **CRITICAL: DO NOT PROVIDE MEDICAL DIAGNOSES.**
4. Focus on one single actionable step or a brief empathetic reflection.
5. Always encourage the user to share more, but keep your part short.`;

// --- AUTH LOGIC ---
let isSignUpMode = false;

document.getElementById('toggle-auth').addEventListener('click', (e) => {
  e.preventDefault();
  isSignUpMode = !isSignUpMode;
  document.getElementById('signup-fields').style.display = isSignUpMode ? 'flex' : 'none';
  document.getElementById('auth-title').innerText = isSignUpMode ? 'Join Us' : 'Welcome Back';
  document.getElementById('auth-subtitle').innerText = isSignUpMode ? 'Create an account to start your journey' : 'Sign in to continue your journey';
  document.getElementById('btn-login').innerText = isSignUpMode ? 'Sign Up' : 'Sign In';
  document.getElementById('toggle-auth').innerText = isSignUpMode ? 'Already have an account? Log In' : "Don't have an account? Sign Up";
});

async function checkAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    currentUser = session.user;
    showDashboard();
  } else {
    showAuth();
  }
}

document.getElementById('btn-login').addEventListener('click', async () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  if (isSignUpMode) {
    const name = document.getElementById('signup-name').value;
    const birthday = document.getElementById('signup-birthday').value;
    const gender = document.getElementById('signup-gender').value;

    if (!email || !password || !name || !birthday || !gender) {
      return alert('Please fill in all fields to sign up.');
    }

    // Format birthday to locale string like the mobile app expects
    const formattedBirthday = new Date(birthday).toLocaleDateString();

    const { data, error } = await supabaseClient.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: name,
          birthday: formattedBirthday,
          gender: gender
        }
      }
    });

    if (error) {
      alert(error.message);
    } else {
      if (data.session) {
        currentUser = data.user;
        showDashboard();
      } else {
        alert("Success! Check your email for the confirmation link.");
      }
    }
  } else {
    if (!email || !password) return alert('Enter email and password');
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    } else {
      currentUser = data.user;
      showDashboard();
    }
  }
});
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.reload();
}

// --- UI LOGIC ---
function showAuth() {
  document.getElementById('auth-container').style.display = 'flex';
  document.getElementById('dashboard-container').style.display = 'none';
}

async function showDashboard() {
  document.getElementById('auth-container').style.display = 'none';
  document.getElementById('dashboard-container').style.display = 'flex';
  document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  await loadProfile();
  await loadJournals();
}

async function loadProfile() {
  const { data } = await supabaseClient.from('profiles').select('*').eq('id', currentUser.id).single();
  if (data) {
    currentProfile = data;
    const isPremium = data.plan_type === 'premium';
    
    // Header & Profile Tab
    document.getElementById('plan-badge').innerText = data.plan_type.toUpperCase();
    document.getElementById('plan-badge').style.color = isPremium ? '#4f46e5' : '#64748b';
    
    // Profile Tab
    document.getElementById('profile-name').innerText = data.full_name || currentUser.email.split('@')[0];
    const planText = isPremium ? 'Premium Member • ' : '';
    document.getElementById('profile-plan-text').innerText = `${planText}${currentUser.email}`;
    document.getElementById('profile-email-row').innerText = currentUser.email;
    document.getElementById('profile-dob').innerText = data.birthday || "Not set";
    document.getElementById('profile-gender').innerText = data.gender || "Not set";
    document.getElementById('profile-date').innerText = new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Update Avatars
    const profileIconContainer = document.getElementById('profile-avatar-container');
    const editAvatarPreview = document.getElementById('avatar-img-preview');
    if (data.avatar_url) {
      const publicUrl = supabaseClient.storage.from('avatars').getPublicUrl(data.avatar_url).data.publicUrl;
      // If we have an avatar container in the profile tab, we can update it. Let's select by id 'profile-avatar-icon'
      const mainAvatar = document.getElementById('profile-avatar-icon');
      if (mainAvatar) {
        mainAvatar.innerHTML = `<img src="${publicUrl}" style="width: 100%; height: 100%; border-radius: 60px; object-fit: cover;">`;
      }
      editAvatarPreview.src = publicUrl;
      editAvatarPreview.style.display = 'block';
    } else {
      const mainAvatar = document.getElementById('profile-avatar-icon');
      if (mainAvatar) {
        mainAvatar.innerHTML = `<i data-lucide="user" style="width: 48px; height: 48px; color: white;"></i>`;
        lucide.createIcons();
      }
      editAvatarPreview.style.display = 'none';
    }

    // Populate Edit Modal
    document.getElementById('edit-name').value = data.full_name || '';
    document.getElementById('edit-email').value = currentUser.email || '';
    document.getElementById('edit-birthday').value = data.birthday || '';
    document.getElementById('edit-gender').value = data.gender || '';

    if (isPremium && data.plan_expires_at) {
      document.getElementById('premium-expiry-row').style.display = 'flex';
      document.getElementById('profile-expires').innerText = new Date(data.plan_expires_at).toLocaleDateString();
    } else {
      document.getElementById('premium-expiry-row').style.display = 'none';
    }

    // Plans Tab Logic
    const basicBtn = document.getElementById('btn-basic-web');
    const premiumBtn = document.getElementById('btn-upgrade-web');

    if (isPremium) {
      basicBtn.innerText = "Downgraded to Basic";
      basicBtn.disabled = true;
      basicBtn.style.cursor = "default";
      basicBtn.style.background = "#f1f5f9";
      basicBtn.style.color = "#94a3b8";

      premiumBtn.innerText = "Cancel Plan";
      premiumBtn.disabled = false;
      premiumBtn.style.cursor = "pointer";
      premiumBtn.style.background = "#f1f5f9";
      premiumBtn.style.color = "#1a1c1e";
    } else {
      basicBtn.innerText = "Current Plan";
      basicBtn.disabled = true;
      basicBtn.style.background = "#f1f5f9";
      basicBtn.style.color = "#94a3b8";
      basicBtn.style.cursor = "default";

      premiumBtn.innerText = "Upgrade Now";
      premiumBtn.disabled = false;
      premiumBtn.style.cursor = "pointer";
      premiumBtn.style.background = "var(--primary)";
      premiumBtn.style.color = "white";
    }

    // Check for pending requests to match mobile logic
    const { data: request } = await supabaseClient
      .from('subscription_requests')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('status', 'pending')
      .single();

    if (request) {
      document.getElementById('pending-request-card').style.display = 'block';
      document.getElementById('pending-request-title').innerText = `Pending ${request.type === 'upgrade' ? 'Upgrade' : 'Cancellation'}`;
      
      premiumBtn.disabled = true;
      premiumBtn.style.opacity = "0.5";
      premiumBtn.style.cursor = "default";
    } else {
      document.getElementById('pending-request-card').style.display = 'none';
      premiumBtn.style.opacity = "1";
    }
  }
}


// --- JOURNAL LOGIC ---
async function loadJournals() {
  const { data } = await supabaseClient.from('journal_entries').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
  const fullList = document.getElementById('full-journal-list');
  
  if (data) {
    journalEntries = data;
    fullList.innerHTML = data.map(e => `
        <div class="glass-card" style="margin-bottom: 20px;">
            <div class="journal-title">${e.title}</div>
            <div class="journal-meta" style="margin-bottom: 12px;">${e.mood} • ${e.date_string}</div>
            <p style="font-size: 14px; line-height: 1.6; color: #1a1c1e;">${e.content}</p>
        </div>
    `).join('');
  }
}

async function saveJournal() {
  const title = document.getElementById('journal-title-input').value.trim();
  const content = document.getElementById('journal-text-input').value.trim();

  if (!title || !content) return alert("Please add a title and some thoughts.");

  const { error } = await supabaseClient.from('journal_entries').insert([{
    user_id: currentUser.id,
    title,
    content,
    mood: currentMood,
    date_string: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    category: 'Web'
  }]);
  
  if (error) alert(error.message);
  else {
    document.getElementById('journal-title-input').value = '';
    document.getElementById('journal-text-input').value = '';
    loadJournals();
  }
}

async function analyzeProgress() {
  if (journalEntries.length === 0) return alert("Please write a few entries first!");

  document.getElementById('analysis-modal').style.display = 'flex';
  const contentDiv = document.getElementById('analysis-content');
  contentDiv.innerText = "Processing your journey with AI...";

  try {
    const prompt = `Analyze these journal entries for a mental health app. 
      ENTRIES: ${JSON.stringify(journalEntries.slice(0, 10).map(e => ({ title: e.title, text: e.content, mood: e.mood })))}
      Provide a progress report with Today, Weekly Trend, and Overall State. Keep it empathetic and brief (max 150 words).`;

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
    }, {
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` }
    });

    contentDiv.innerHTML = response.data.choices[0].message.content.replace(/\n/g, '<br>');
  } catch (err) {
    contentDiv.innerText = "Error generating report. Please try again.";
  }
}

// --- CHAT LOGIC ---
async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  appendMessage('user', text);
  input.value = '';

  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text }
      ],
    }, {
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` }
    });

    appendMessage('bot', response.data.choices[0].message.content);
  } catch (err) {
    appendMessage('bot', "I'm having trouble connecting right now. Let's try again in a moment.");
  }
}

function appendMessage(role, text) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerText = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

// --- EVENT LISTENERS ---
document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
  item.addEventListener('click', () => {
    const tabId = item.getAttribute('data-tab');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.getElementById(`tab-${tabId}`).style.display = 'block';
document.getElementById('tab-title').innerText = item.querySelector('span').innerText;
  });
});

document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        currentMood = btn.getAttribute('data-mood');
    });
});

document.getElementById('btn-logout').addEventListener('click', logout);
document.getElementById('btn-save-journal').addEventListener('click', saveJournal);
document.getElementById('btn-analyze-web').addEventListener('click', analyzeProgress);
document.getElementById('btn-send-chat').addEventListener('click', sendChatMessage);
document.getElementById('chat-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendChatMessage();
});

// --- REALTIME & MODALS ---
function showMessageModal(title, text) {
  document.getElementById('message-modal-title').innerText = title;
  document.getElementById('message-modal-text').innerText = text;
  document.getElementById('message-modal').style.display = 'flex';
}

let realtimeSetup = false;
function setupRealtime() {
  if (!currentUser || realtimeSetup) return;
  
  supabaseClient.channel('custom-all-channel')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${currentUser.id}` },
      (payload) => {
        if (payload.old.plan_type !== payload.new.plan_type) {
          loadProfile();
          const planName = payload.new.plan_type === 'premium' ? 'Premium' : 'Basic';
          showMessageModal("Plan Updated", `Your account is now on the ${planName} plan!`);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'subscription_requests', filter: `user_id=eq.${currentUser.id}` },
      (payload) => {
        loadProfile();
        if (payload.new.status === 'approved') {
          showMessageModal("Request Approved", `Your subscription request was approved and your plan has been updated.`);
        } else if (payload.new.status === 'declined') {
          showMessageModal("Request Declined", `Your subscription request could not be processed.`);
        }
      }
    )
    .subscribe();
  
  realtimeSetup = true;
}

document.getElementById('btn-upgrade-web').addEventListener('click', async () => {
    const isPremium = currentProfile && currentProfile.plan_type === 'premium';
    const type = isPremium ? 'cancel' : 'upgrade';

    const { error } = await supabaseClient.from('subscription_requests').insert([{
        user_id: currentUser.id,
        type: type,
        status: 'pending'
    }]);

    if (error) {
        alert(error.message);
    } else {
        // Show success modal and instantly refresh the UI
        showMessageModal(
          "Request Sent", 
          `${isPremium ? 'Cancel' : 'Upgrade'} request sent! Check your email to confirm.`
        );
        loadProfile();
    }
});

// Ensure realtime is set up when dashboard loads
const originalShowDashboard = showDashboard;
showDashboard = function() {
  originalShowDashboard();
  setupRealtime();
};

// --- EDIT PROFILE LOGIC ---
let selectedAvatarFile = null;

document.getElementById('avatar-upload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedAvatarFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById('avatar-img-preview');
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById('btn-save-profile').addEventListener('click', async () => {
  const btn = document.getElementById('btn-save-profile');
  btn.innerText = 'Saving...';
  btn.disabled = true;

  try {
    const newName = document.getElementById('edit-name').value;
    const newEmail = document.getElementById('edit-email').value;
    const newPassword = document.getElementById('edit-password').value;
    const newBirthday = document.getElementById('edit-birthday').value;
    const newGender = document.getElementById('edit-gender').value;

    let avatar_url = currentProfile.avatar_url;

    // 1. Upload Avatar if changed
    if (selectedAvatarFile) {
      const fileExt = selectedAvatarFile.name.split('.').pop();
      const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabaseClient.storage
        .from('avatars')
        .upload(fileName, selectedAvatarFile, { upsert: true });
      
      if (uploadError) throw uploadError;
      avatar_url = fileName;
    }

    // 2. Update Profiles Table
    const { error: profileError } = await supabaseClient.from('profiles')
      .update({
        full_name: newName,
        birthday: newBirthday,
        gender: newGender,
        avatar_url: avatar_url
      })
      .eq('id', currentUser.id);
    
    if (profileError) throw profileError;

    // 3. Update Credentials (Email/Password)
    let updatePayload = {};
    if (newEmail && newEmail !== currentUser.email) updatePayload.email = newEmail;
    if (newPassword) updatePayload.password = newPassword;

    if (Object.keys(updatePayload).length > 0) {
      const { error: authError } = await supabaseClient.auth.updateUser(updatePayload);
      if (authError) throw authError;
    }

    document.getElementById('edit-profile-modal').style.display = 'none';
    showMessageModal('Success', 'Your profile has been updated!');
    selectedAvatarFile = null;
    await loadProfile();

  } catch (err) {
    alert(err.message);
  } finally {
    btn.innerText = 'Save Changes';
    btn.disabled = false;
  }
});

checkAuth();
