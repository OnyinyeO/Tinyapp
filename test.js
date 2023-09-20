const age = {
  onyinye: 32,
  leo: 2,
  dawg: 5,
  'adfads adfa ieaie888eqrew8qpweqwiejfqlknewfpqdifapdiofapdsiofnadopsfa': 66554,
};

const namesOfPeople = [
  'onyinye',
  'leo',
  'adfads adfa ieaie888eqrew8qpweqwiejfqlknewfpqdifapdiofapdsiofnadopsfa',
];

// const getAge = (names) => {
//   for (let indexOfArray = 0; indexOfArray < names.length; indexOfArray++) {
//     console.log(names[indexOfArray]);
// const name = names[indexOfArray];
//     const personAge = age[name];
//     console.log(personAge);
//   }
// };
// getAge(namesOfPeople);

const getAges = (names) => {
  for (let name of names) {
    const personAge = age[name];
    console.log(personAge);
  }
};

getAges(namesOfPeople);

//--------headers.ejs-------
// <!-- <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
//       <div class="navbar-nav">
//         <% if(user) { %>
//         <a class="nav-item nav-link" href="/urls">My URLs</a>
//         <a class="nav-item nav-link" href="/urls/new">Create New URL</a>
//         <%} %>
//       </div>
//     </div>
//     Conditional user section -->
//     <!-- <% if (user) { %> -->
//     <!-- Display user email and logout button -->
//     <!-- <span class="nav-item nav-link">Welcome, <%= user.email %>!</span>
//     <form method="POST" action="/logout">
//       <button type="submit">Log Out</button>
//     </form>
//     <% } else { %> -->
//     <!-- Display registration and login links for non-logged-in users -->
//     <!-- <a class="nav-item nav-link" href="/register">Register</a>
//     <a class="nav-item nav-link" href="/login">Login</a>
//     <% } %> -->

//-------urls_show.ejs-------
// <!-- Include header partial -->
// <!-- <%- include('partials/_header') %>
// <div class="card text-center">
//   <div class="card-header"></div>
//   <div class="card-body">
//     <h5 class="card-title">TinyURL for: <%= longUrl %></h5>
//     <p class="card-text">Short URL ID: <%= id %></p>

//     <% if(user) { %>
//     <form method="POST" action="/urls/<%= id %>/edit">
//       <h6>Edit</h6>
//       <label for="longUrl">New URL:</label>
//       <input
//         type="text"
//         name="longUrl"
//         placeholder=" http://"
//         style="width: 300px; height: 40px; margin: 0em"
//       />
//       <button type="submit" class="btn btn-primary">Submit</button>
//     </form>
//     <% } %>
//   </div>
//   <div class="card-footer text-muted"></div>
// </div> -->

//------index.ejs-----
// <!-- Include header partial -->
//     <!-- <%- include('partials/_header') %>

//     <main style="margin: 1em">
//       <h3>My URLs</h3>
//       <table class="table">
//         <thead>
//           <tr>
//             <th scope="col">Short URL ID</th>
//             <th scope="col">Long URL</th>
//             <th scope="col">Edit</th>
//             <th scope="col">Delete</th>
//           </tr>
//         </thead>
//         <tbody>
//           <% for (const id in urls) { %>
//           <tr>
//             <td><%= urls[id].shortUrl %></td>
//             <td><%= urls[id].longUrl %></td>
//             <td>
//               <a href="/urls/<%= urls[id].shortUrl %>">Edit</a>
//             </td>
//             <td>
//               <form
//                 method="POST"
//                 action="/urls/<%= urls[id].shortUrl %>/delete"
//               >
//                 <button type="submit">Delete</button>
//               </form>
//             </td>
//           </tr>
//           <% } %>
//         </tbody>
//       </table>
//     </main> -->
