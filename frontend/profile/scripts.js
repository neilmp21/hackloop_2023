document.addEventListener('DOMContentLoaded', () => {
    const profileCards = document.getElementById('profile-cards');
  
    const fetchProfiles = () => {
      fetch('/getProfiles')
        .then(response => response.json())
        .then(profiles => {
          displayProfiles(profiles);
        });
    };
  
    const displayProfiles = (profiles) => {
      profileCards.innerHTML = '';
  
      profiles.forEach(profile => {
        const card = createProfileCard(profile);
        profileCards.appendChild(card);
      });
    };
  
    const createProfileCard = (profile) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.id = profile.id;
  
      const image = document.createElement('img');
      image.src = profile.photo;
      image.alt = profile.name;
  
      const name = document.createElement('h3');
      name.textContent = profile.name;
  
      const phoneNumber = document.createElement('p');
      phoneNumber.textContent = `Phone: ${profile.phoneNumber}`;
  
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => {
        const profileId = card.dataset.id;
        deleteProfile(profileId);
      });
  
      card.appendChild(image);
      card.appendChild(name);
      card.appendChild(phoneNumber);
      card.appendChild(deleteButton);
  
      return card;
    };
  
    const deleteProfile = (id) => {
      fetch(`/deleteProfile/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(result => {
          if (result.success) {
            fetchProfiles();
          } else {
            console.error(result.message);
          }
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });
    };
  
    fetchProfiles();
  });
  